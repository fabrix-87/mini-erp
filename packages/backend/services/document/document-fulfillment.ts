import { Document, DocumentType, Prisma } from "@/generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import {
  canTransition,
  DOCUMENT_TYPE_STATUS_TRANSITIONS,
  type DocumentStatus,
} from "@mini-erp/shared";
import { prisma } from "@/config/prisma-config";
import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import type { DocumentCreateContext } from "@/types";
import { createStatusHistory } from "./document-status-service";
import { lockDocumentStatus } from "./document-concurrency";

/** Statuses from which line deliveries can be registered. */
const FULFILLABLE_STATUSES: readonly DocumentStatus[] = [
  "ACCEPTED",
  "PREPARING",
  "PARTIALLY_FULFILLED",
];

/** Line types that carry deliverable quantities. */
const FULFILLABLE_LINE_TYPES = ["PRODUCT", "SERVICE"] as const;

/** Fulfillment status computed from document lines. */
export type FulfillmentStatus = "PENDING" | "PARTIALLY_FULFILLED" | "FULFILLED";

/** Aggregate fulfillment result for a document. */
export interface DocumentFulfillmentStatus {
  status: FulfillmentStatus;
  totalQuantity: Decimal;
  deliveredQuantity: Decimal;
  fulfillmentRate: Decimal;
}

/** Fulfillment breakdown for one document line. */
export interface DocumentLineFulfillment {
  lineId: string;
  lineNumber: number;
  nameSystem: string;
  quantity: Decimal;
  quantityDelivered: Decimal;
  quantityRemaining: Decimal;
  fulfillmentRate: Decimal;
}

/** Detailed fulfillment result for a document. */
export interface DocumentFulfillmentDetails {
  overall: DocumentFulfillmentStatus;
  lines: DocumentLineFulfillment[];
}

/** Arguments required to calculate fulfillment for a document. */
export interface CalculateFulfillmentArgs {
  documentId: string;
  tenantId: string;
}

/** Arguments required to update the delivered quantity of a line. */
export interface UpdateLineDeliveredQuantityArgs {
  lineId: string;
  tenantId: string;
  quantityDelivered: Decimal.Value;
  context: DocumentCreateContext;
}

/**
 * Calculates the fulfillment status of a document from its lines.
 * Non-fulfillable lines, such as TEXT or PAGE_BREAK lines, are excluded.
 *
 * @param args - Document ID and tenant context
 * @param args.documentId - Document ID
 * @param args.tenantId - Current tenant ID
 * @returns Aggregate fulfillment status
 * @throws NotFoundError when the document does not exist
 */
export async function calculateFulfillmentStatus(
  args: CalculateFulfillmentArgs,
): Promise<DocumentFulfillmentStatus> {
  const { documentId, tenantId } = args;

  const document = await prisma.document.findFirst({
    where: withSoftDelete(withTenantId({ id: documentId }, tenantId)),
    select: { id: true },
  });

  if (!document) {
    throw new NotFoundError("Document not found");
  }

  return computeFulfillment(prisma, documentId, tenantId);
}

/**
 * Returns the detailed fulfillment breakdown of a document.
 *
 * @param args - Document ID and tenant context
 * @param args.documentId - Document ID
 * @param args.tenantId - Current tenant ID
 * @returns Overall status and per-line fulfillment details
 * @throws NotFoundError when the document does not exist
 */
export async function getDocumentFulfillmentDetails(
  args: CalculateFulfillmentArgs,
): Promise<DocumentFulfillmentDetails> {
  const { documentId, tenantId } = args;

  const overall = await calculateFulfillmentStatus({
    documentId,
    tenantId,
  });

  const lines = await prisma.documentLine.findMany({
    where: withSoftDelete(
      withTenantId(
        {
          documentId,
          lineType: {
            in: ["PRODUCT", "SERVICE"],
          },
        },
        tenantId,
      ),
    ),
    select: {
      id: true,
      lineNumber: true,
      nameSystem: true,
      quantity: true,
      quantityDelivered: true,
    },
    orderBy: {
      lineNumber: "asc",
    },
  });

  const lineDetails = lines.map((line) => {
    const quantityRemaining = line.quantity.minus(line.quantityDelivered);

    const fulfillmentRate = line.quantity.isZero()
      ? new Decimal(0)
      : line.quantityDelivered.div(line.quantity).times(100);

    return {
      lineId: line.id,
      lineNumber: line.lineNumber,
      nameSystem: line.nameSystem,
      quantity: line.quantity,
      quantityDelivered: line.quantityDelivered,
      quantityRemaining,
      fulfillmentRate,
    };
  });

  return {
    overall,
    lines: lineDetails,
  };
}

/**
 * Updates the delivered quantity of a document line and recalculates the
 * parent document fulfillment status.
 *
 * @param args - Line, tenant and fulfillment context
 * @param args.lineId - Document line ID
 * @param args.tenantId - Current tenant ID
 * @param args.quantityDelivered - New cumulative delivered quantity
 * @param args.context - Tenant and authenticated user context
 * @returns The updated document
 * @throws NotFoundError when the line does not exist
 * @throws BadRequestError when the parent document is not editable
 */
export async function updateLineDeliveredQuantity(
  args: UpdateLineDeliveredQuantityArgs,
): Promise<Document> {
  const { lineId, tenantId, quantityDelivered, context } = args;

  return prisma.$transaction(async (tx) => {
    const line = await tx.documentLine.findFirst({
      where: withSoftDelete(withTenantId({ id: lineId }, tenantId)),
      select: { id: true, documentId: true, lineType: true, quantity: true },
    });

    if (!line) {
      throw new NotFoundError("Document line not found");
    }

    if (!(FULFILLABLE_LINE_TYPES as readonly string[]).includes(line.lineType)) {
      throw new BadRequestError("Only PRODUCT and SERVICE lines can be delivered");
    }

    const deliveredQuantity = new Decimal(quantityDelivered);

    if (deliveredQuantity.lessThan(0)) {
      throw new BadRequestError("Delivered quantity cannot be negative");
    }

    if (deliveredQuantity.greaterThan(line.quantity)) {
      throw new BadRequestError("Delivered quantity cannot exceed line quantity");
    }

    const document = await tx.document.findFirst({
      where: withSoftDelete(withTenantId({ id: line.documentId }, tenantId)),
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    if (!FULFILLABLE_STATUSES.includes(document.status)) {
      throw new BadRequestError(`Document in status ${document.status} cannot be fulfilled`);
    }

    await lockDocumentStatus(tx, document);

    await tx.documentLine.update({
      where: { id: line.id },
      data: { quantityDelivered: deliveredQuantity },
    });

    const fulfillment = await computeFulfillment(tx, document.id, tenantId);
    const targetStatus = resolveFulfillmentTargetStatus(
      document.documentType,
      document.status,
      fulfillment.status,
    );

    if (targetStatus === null) {
      return document;
    }

    const updatedDocument = await tx.document.update({
      where: { id: document.id },
      data: { status: targetStatus },
    });

    await createStatusHistory({
      documentId: document.id,
      fromStatus: document.status,
      toStatus: targetStatus,
      context,
      tx,
    });

    return updatedDocument;
  });
}

/**
 * Computes the aggregate fulfillment of a document from its non-deleted lines.
 *
 * @param db - Prisma client or transaction client
 * @param documentId - Document ID
 * @param tenantId - Current tenant ID
 * @returns Aggregate fulfillment status
 */
async function computeFulfillment(
  db: Prisma.TransactionClient,
  documentId: string,
  tenantId: string,
): Promise<DocumentFulfillmentStatus> {
  const lines = await db.documentLine.findMany({
    where: withSoftDelete(
      withTenantId({ documentId, lineType: { in: [...FULFILLABLE_LINE_TYPES] } }, tenantId),
    ),
    select: { quantity: true, quantityDelivered: true },
  });

  const totalQuantity = lines.reduce((sum, l) => sum.plus(l.quantity), new Decimal(0));
  const deliveredQuantity = lines.reduce((sum, l) => sum.plus(l.quantityDelivered), new Decimal(0));

  const fulfillmentRate = totalQuantity.isZero()
    ? new Decimal(0)
    : deliveredQuantity.div(totalQuantity).times(100);

  const status: FulfillmentStatus = deliveredQuantity.isZero()
    ? "PENDING"
    : deliveredQuantity.lessThan(totalQuantity)
      ? "PARTIALLY_FULFILLED"
      : "FULFILLED";

  return { status, totalQuantity, deliveredQuantity, fulfillmentRate };
}

/**
 * Maps a fulfillment status to a valid document status transition.
 *
 * @param documentType - Document type
 * @param currentStatus - Current document status
 * @param fulfillmentStatus - Computed fulfillment status
 * @returns Target document status
 * @throws BadRequestError when no valid transition exists
 */
function mapFulfillmentToDocumentStatus(
  documentType: DocumentType,
  currentStatus: DocumentStatus,
  fulfillmentStatus: FulfillmentStatus,
): DocumentStatus {
  const allowedStatuses = DOCUMENT_TYPE_STATUS_TRANSITIONS[documentType][currentStatus] ?? [];

  const targetStatus: DocumentStatus =
    fulfillmentStatus === "FULFILLED"
      ? "FULFILLED"
      : fulfillmentStatus === "PARTIALLY_FULFILLED"
        ? "PARTIALLY_FULFILLED"
        : "ACCEPTED";

  if (!allowedStatuses.includes(targetStatus)) {
    throw new BadRequestError(
      `Transition from ${currentStatus} to ${targetStatus} is not allowed for ${documentType}`,
    );
  }

  return targetStatus;
}

/**
 * Maps a computed fulfillment status to the document status transition to apply.
 *
 * @param documentType - Document type
 * @param currentStatus - Current document status
 * @param fulfillmentStatus - Computed fulfillment status
 * @returns The target status, or null when the document status must not change
 * @throws BadRequestError when fulfillment would be reverted or the transition is not allowed
 */
function resolveFulfillmentTargetStatus(
  documentType: DocumentType,
  currentStatus: DocumentStatus,
  fulfillmentStatus: FulfillmentStatus,
): DocumentStatus | null {
  if (fulfillmentStatus === "PENDING") {
    if (currentStatus === "PARTIALLY_FULFILLED") {
      throw new BadRequestError("Fulfillment cannot be reverted to zero");
    }
    return null;
  }

  const targetStatus: DocumentStatus = fulfillmentStatus;

  if (targetStatus === currentStatus) {
    return null;
  }

  if (!canTransition(documentType, currentStatus, targetStatus)) {
    throw new BadRequestError(
      `Transition from ${currentStatus} to ${targetStatus} is not allowed for ${documentType}`,
    );
  }

  return targetStatus;
}
