import { Document, DocumentType, Prisma } from "@/generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import {
  DOCUMENT_TYPE_STATUS_TRANSITIONS,
  isDocumentEditable,
  type DocumentStatus,
} from "@mini-erp/shared";
import { prisma } from "@/config/prisma-config";
import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import type { DocumentCreateContext } from "@/types";

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
    select: {
      id: true,
      lines: {
        where: {
          lineType: {
            in: ["PRODUCT", "SERVICE"],
          },
        },
        select: {
          quantity: true,
          quantityDelivered: true,
        },
      },
    },
  });

  if (!document) {
    throw new NotFoundError("Document not found");
  }

  const totalQuantity = document.lines.reduce(
    (sum, line) => sum.plus(line.quantity),
    new Decimal(0),
  );

  const deliveredQuantity = document.lines.reduce(
    (sum, line) => sum.plus(line.quantityDelivered),
    new Decimal(0),
  );

  const fulfillmentRate = totalQuantity.isZero()
    ? new Decimal(0)
    : deliveredQuantity.div(totalQuantity).times(100);

  const status: FulfillmentStatus = deliveredQuantity.isZero()
    ? "PENDING"
    : deliveredQuantity.lessThan(totalQuantity)
      ? "PARTIALLY_FULFILLED"
      : "FULFILLED";

  return {
    status,
    totalQuantity,
    deliveredQuantity,
    fulfillmentRate,
  };
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
      select: {
        id: true,
        documentId: true,
        quantity: true,
      },
    });

    if (!line) {
      throw new NotFoundError("Document line not found");
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
      select: {
        id: true,
        documentType: true,
        status: true,
      },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    if (!isDocumentEditable(document.status)) {
      throw new BadRequestError(`Document in status ${document.status} cannot be fulfilled`);
    }

    await tx.documentLine.update({
      where: { id: line.id },
      data: {
        quantityDelivered: deliveredQuantity,
      },
    });

    const fulfillment = await calculateFulfillmentInTransaction({
      documentId: document.id,
      tenantId,
      tx,
    });

    const targetStatus = mapFulfillmentToDocumentStatus(
      document.documentType,
      document.status,
      fulfillment.status,
    );

    const updatedDocument = await tx.document.update({
      where: { id: document.id },
      data: {
        status: targetStatus,
      },
    });

    await tx.documentStatusHistory.create({
      data: {
        documentId: document.id,
        fromStatus: document.status,
        toStatus: targetStatus,
        changedBy: context.userId,
      },
    });

    return updatedDocument;
  });
}

/**
 * Calculates fulfillment inside an existing transaction.
 *
 * @param args - Fulfillment context
 * @param args.documentId - Document ID
 * @param args.tenantId - Current tenant ID
 * @param args.tx - Prisma transaction client
 * @returns Aggregate fulfillment status
 */
async function calculateFulfillmentInTransaction(args: {
  documentId: string;
  tenantId: string;
  tx: Prisma.TransactionClient;
}): Promise<DocumentFulfillmentStatus> {
  const { documentId, tenantId, tx } = args;

  const lines = await tx.documentLine.findMany({
    where: withTenantId(
      {
        documentId,
        lineType: {
          in: ["PRODUCT", "SERVICE"],
        },
      },
      tenantId,
    ),
    select: {
      quantity: true,
      quantityDelivered: true,
    },
  });

  const totalQuantity = lines.reduce((sum, line) => sum.plus(line.quantity), new Decimal(0));

  const deliveredQuantity = lines.reduce(
    (sum, line) => sum.plus(line.quantityDelivered),
    new Decimal(0),
  );

  const fulfillmentRate = totalQuantity.isZero()
    ? new Decimal(0)
    : deliveredQuantity.div(totalQuantity).times(100);

  const status: FulfillmentStatus = deliveredQuantity.isZero()
    ? "PENDING"
    : deliveredQuantity.lessThan(totalQuantity)
      ? "PARTIALLY_FULFILLED"
      : "FULFILLED";

  return {
    status,
    totalQuantity,
    deliveredQuantity,
    fulfillmentRate,
  };
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
