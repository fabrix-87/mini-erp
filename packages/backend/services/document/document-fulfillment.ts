import { Prisma, type Document, type DocumentType } from "@/generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import { canTransition, type DocumentStatus } from "@mini-erp/shared";
import { prisma } from "@/config/prisma-config";
import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import { FULFILLABLE_LINE_TYPES, FULFILLABLE_STATUSES, FULFILLMENT_TRACKED_TYPES, type DocumentCreateContext, type FulfillmentStatus } from "@/types";
import { createStatusHistory } from "./document-status-history";
import { lockDocumentStatus } from "./document-concurrency";

/** Fulfillment breakdown for one document line. */
export interface DocumentLineFulfillment {
  lineId: string;
  lineNumber: number;
  nameSystem: string;
  unit: string;
  quantity: Decimal;
  quantityDelivered: Decimal;
  quantityRemaining: Decimal;
  fulfillmentRate: Decimal;
}

/** Aggregate fulfillment of a document. Quantities of different units are never summed. */
export interface DocumentFulfillmentStatus {
  status: FulfillmentStatus;
  /** Average of the per-line rates, in percent. */
  fulfillmentRate: Decimal;
  linesTotal: number;
  linesFulfilled: number;
}

/** Detailed fulfillment result for a document. */
export interface DocumentFulfillmentDetails {
  overall: DocumentFulfillmentStatus;
  lines: DocumentLineFulfillment[];
}

/** Arguments required to read the fulfillment of a document. */
export interface CalculateFulfillmentArgs {
  documentId: string;
  tenantId: string;
}

type FulfillmentLineRow = {
  id: string;
  lineNumber: number;
  nameSystem: string;
  unit: string;
  quantity: Decimal;
  quantityDelivered: Decimal;
};

/** Loads the deliverable lines. DocumentLine has no soft-delete column, so no deletedAt filter. */
function loadFulfillmentLines(
  db: Pick<Prisma.TransactionClient, "documentLine">,
  documentId: string,
  tenantId: string,
): Promise<FulfillmentLineRow[]> {
  return db.documentLine.findMany({
    where: { tenantId, documentId, lineType: { in: [...FULFILLABLE_LINE_TYPES] } },
    select: {
      id: true,
      lineNumber: true,
      nameSystem: true,
      unit: true,
      quantity: true,
      quantityDelivered: true,
    },
    orderBy: { lineNumber: "asc" },
  });
}

/** Computes the per-line breakdown and the overall status from the deliverable lines. */
function summarizeFulfillment(rows: FulfillmentLineRow[]): DocumentFulfillmentDetails {
  const lines: DocumentLineFulfillment[] = rows.map((row) => ({
    lineId: row.id,
    lineNumber: row.lineNumber,
    nameSystem: row.nameSystem,
    unit: row.unit,
    quantity: row.quantity,
    quantityDelivered: row.quantityDelivered,
    quantityRemaining: Decimal.max(row.quantity.minus(row.quantityDelivered), 0),
    fulfillmentRate: row.quantity.isZero()
      ? new Decimal(0)
      : Decimal.min(row.quantityDelivered.div(row.quantity).times(100), 100).toDecimalPlaces(2),
  }));

  const linesFulfilled = lines.filter((line) => line.quantityRemaining.isZero()).length;
  const anyDelivered = lines.some((line) => line.quantityDelivered.greaterThan(0));
  const status: FulfillmentStatus = !anyDelivered
    ? "PENDING"
    : linesFulfilled === lines.length
      ? "FULFILLED"
      : "PARTIALLY_FULFILLED";

  const fulfillmentRate =
    lines.length === 0
      ? new Decimal(0)
      : lines
          .reduce((sum, line) => sum.plus(line.fulfillmentRate), new Decimal(0))
          .div(lines.length)
          .toDecimalPlaces(2);

  return { overall: { status, fulfillmentRate, linesTotal: lines.length, linesFulfilled }, lines };
}

/**
 * Returns the fulfillment breakdown of an order.
 *
 * @param args - Document ID and tenant
 * @returns Overall status and per-line details
 * @throws NotFoundError when the document does not exist
 * @throws BadRequestError when the document type has no fulfillment tracking
 */
export async function getDocumentFulfillmentDetails(
  args: CalculateFulfillmentArgs,
): Promise<DocumentFulfillmentDetails> {
  const { documentId, tenantId } = args;
  const document = await prisma.document.findFirst({
    where: withSoftDelete(withTenantId({ id: documentId }, tenantId)) as Prisma.DocumentWhereInput,
    select: { documentType: true },
  });
  if (!document) throw new NotFoundError("Document not found");
  if (!FULFILLMENT_TRACKED_TYPES.includes(document.documentType)) {
    throw new BadRequestError(`Fulfillment is not tracked for ${document.documentType} documents`);
  }
  return summarizeFulfillment(await loadFulfillmentLines(prisma, documentId, tenantId));
}

/**
 * Returns only the overall fulfillment status of an order.
 * @throws NotFoundError | BadRequestError
 */
export async function calculateFulfillmentStatus(
  args: CalculateFulfillmentArgs,
): Promise<DocumentFulfillmentStatus> {
  return (await getDocumentFulfillmentDetails(args)).overall;
}

/**
 * Applies a just-formalized delivery note to its source order, inside the formalization
 * transaction: increments the delivered quantity of the referenced order lines, then
 * moves the order to PARTIALLY_FULFILLED or FULFILLED with a history entry.
 * A delivery note without a FULFILLS relation (standalone) changes nothing.
 * The order is locked, so concurrent formalizations of notes for the same order are serialized.
 *
 * @param args - Formalized delivery note, context and transaction client
 * @throws BadRequestError when the order is not fulfillable, 
 * references a line of another order, or exceeds the remaining quantity
 */
export async function applyDeliveryNoteToOrder(args: {
  deliveryNote: Document;
  context: DocumentCreateContext;
  tx: Prisma.TransactionClient;
}): Promise<void> {
  const { deliveryNote, context, tx } = args;
  const { tenantId } = deliveryNote;

  const relation = await tx.documentRelation.findFirst({
    where: { tenantId, targetDocumentId: deliveryNote.id, relationType: "FULFILLS" },
    select: { sourceDocumentId: true },
  });
  if (!relation) return;

  const order = await tx.document.findFirst({
    where: withSoftDelete(
      withTenantId({ id: relation.sourceDocumentId }, tenantId),
    ) as Prisma.DocumentWhereInput,
  });
  if (!order) throw new NotFoundError("Source order not found");
  if (order.documentType !== "ORDER") {
    throw new BadRequestError("Only orders can be fulfilled by a delivery note");
  }
  if (!FULFILLABLE_STATUSES.includes(order.status)) {
    throw new BadRequestError(`Order in status ${order.status} cannot be fulfilled`);
  }
  await lockDocumentStatus(tx, order);

  const noteLines = await tx.documentLine.findMany({
    where: { tenantId, documentId: deliveryNote.id, lineType: { in: [...FULFILLABLE_LINE_TYPES] } },
    select: { sourceLineId: true, quantity: true },
  });

  const delivered = new Map<string, Decimal>();
  for (const line of noteLines) {
    // Extra or manual lines have no source line and do not affect the order.
    if (!line.sourceLineId) continue;
    delivered.set(
      line.sourceLineId,
      (delivered.get(line.sourceLineId) ?? new Decimal(0)).plus(line.quantity),
    );
  }
  if (delivered.size === 0) return;

  const orderLines = await tx.documentLine.findMany({
    where: { tenantId, documentId: order.id, id: { in: [...delivered.keys()] } },
    select: { id: true, quantity: true, quantityDelivered: true },
  });
  if (orderLines.length !== delivered.size) {
    throw new BadRequestError(
      "A delivery note line references a line that does not belong to the order",
    );
  }
  for (const orderLine of orderLines) {
    const remaining = orderLine.quantity.minus(orderLine.quantityDelivered);
    if ((delivered.get(orderLine.id) as Decimal).greaterThan(remaining)) {
      throw new BadRequestError(
        `Delivered quantity exceeds the remaining quantity of order line ${orderLine.id}`,
      );
    }
  }

  for (const [lineId, quantity] of delivered) {
    await tx.documentLine.update({
      where: { tenantId_id: { tenantId, id: lineId } },
      data: { quantityDelivered: { increment: quantity } },
    });
  }

  const { overall } = summarizeFulfillment(await loadFulfillmentLines(tx, order.id, tenantId));
  const targetStatus = resolveFulfillmentTargetStatus(
    order.documentType,
    order.status,
    overall.status,
  );
  if (targetStatus === null) return;

  await tx.document.update({
    where: { tenantId_id: { tenantId, id: order.id } },
    data: { status: targetStatus, updatedByUserId: context.userId },
  });
  await createStatusHistory({
    documentId: order.id,
    fromStatus: order.status,
    toStatus: targetStatus,
    context,
    reason: `Delivery note ${deliveryNote.documentNumber ?? deliveryNote.id}`,
    tx,
  });
}

/**
 * Maps a computed fulfillment status to the order status transition to apply.
 *
 * @returns The target status, or null when the order status must not change
 * @throws BadRequestError when the transition is not allowed
 */
function resolveFulfillmentTargetStatus(
  documentType: DocumentType,
  currentStatus: DocumentStatus,
  fulfillmentStatus: FulfillmentStatus,
): DocumentStatus | null {
  if (fulfillmentStatus === "PENDING") return null;
  if (fulfillmentStatus === currentStatus) return null;
  if (!canTransition(documentType, currentStatus, fulfillmentStatus)) {
    throw new BadRequestError(
      `Transition from ${currentStatus} to ${fulfillmentStatus} is not allowed for ${documentType}`,
    );
  }
  return fulfillmentStatus;
}
