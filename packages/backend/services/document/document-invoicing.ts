import { Prisma, type Document } from "@/generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import {
  CREDITABLE_INVOICE_STATUSES,
  DocumentCreateContext,
  INVOICEABLE_DELIVERY_NOTE_STATUSES,
  INVOICEABLE_ORDER_STATUSES,
} from "@/types";
import { lockDocumentStatus } from "./document-concurrency";
import { closeIfFullyProcessed } from "./document-auto-close";

const TRACKED_LINE_TYPES = ["PRODUCT", "SERVICE", "DISCOUNT"] as const;

/** Sums the quantities of a document's lines by source line; lines without a source are ignored. */
async function sumQuantitiesBySource(
  tx: Prisma.TransactionClient,
  document: Document,
): Promise<Map<string, Decimal>> {
  const lines = await tx.documentLine.findMany({
    where: {
      tenantId: document.tenantId,
      documentId: document.id,
      lineType: { in: [...TRACKED_LINE_TYPES] },
    },
    select: { sourceLineId: true, quantity: true },
  });
  const sums = new Map<string, Decimal>();
  for (const line of lines) {
    if (!line.sourceLineId) continue;
    sums.set(
      line.sourceLineId,
      (sums.get(line.sourceLineId) ?? new Decimal(0)).plus(line.quantity),
    );
  }
  return sums;
}

/** Loads a non-deleted document of the tenant. */
async function loadDocument(
  tx: Prisma.TransactionClient,
  id: string,
  tenantId: string,
): Promise<Document> {
  const document = await tx.document.findFirst({
    where: withSoftDelete(withTenantId({ id }, tenantId)) as Prisma.DocumentWhereInput,
  });
  if (!document) throw new NotFoundError("Source document not found");
  return document;
}

/** Loads the lines of `documentId` referenced by `ids`, failing if any is missing. */
async function loadLines(
  tx: Prisma.TransactionClient,
  tenantId: string,
  documentId: string,
  ids: string[],
) {
  const lines = await tx.documentLine.findMany({
    where: { tenantId, documentId, id: { in: ids } },
    select: {
      id: true,
      quantity: true,
      quantityDelivered: true,
      quantityInvoiced: true,
      quantityReturned: true,
      sourceLineId: true,
    },
  });
  if (lines.length !== ids.length) {
    throw new BadRequestError(
      "A line references a line that does not belong to the source document",
    );
  }
  return lines;
}

/**
 * Applies a just-formalized invoice to its source (order or delivery note), inside the
 * formalization transaction, increasing `quantityInvoiced`.
 * Order: x <= quantity - max(delivered, invoiced). Delivery note: x <= quantity - invoiced on the
 * note line, then invoiced + x <= quantity on the order line the note line came from.
 * An invoice without a CONVERTS_TO relation from an order or delivery note changes nothing.
 *
 * @throws BadRequestError when a source is not invoiceable or a quantity exceeds the remaining one
 */
export async function applyInvoiceToSources(args: {
  invoice: Document;
  context: DocumentCreateContext;
  tx: Prisma.TransactionClient;
}): Promise<void> {
  const { invoice, tx, context } = args;
  const { tenantId } = invoice;

  const relation = await tx.documentRelation.findFirst({
    where: {
      tenantId,
      targetDocumentId: invoice.id,
      relationType: "CONVERTS_TO",
      sourceDocument: { documentType: { in: ["ORDER", "DELIVERY_NOTE"] } },
    },
    select: { sourceDocumentId: true },
  });
  if (!relation) return;

  const quantities = await sumQuantitiesBySource(tx, invoice);
  if (quantities.size === 0) return;
  const source = await loadDocument(tx, relation.sourceDocumentId, tenantId);

  if (source.documentType === "ORDER") {
    if (!INVOICEABLE_ORDER_STATUSES.includes(source.status)) {
      throw new BadRequestError(`Order in status ${source.status} cannot be invoiced`);
    }
    await lockDocumentStatus(tx, source);
    const lines = await loadLines(tx, tenantId, source.id, [...quantities.keys()]);
    for (const line of lines) {
      const covered = Decimal.max(line.quantityDelivered, line.quantityInvoiced);
      if ((quantities.get(line.id) as Decimal).greaterThan(line.quantity.minus(covered))) {
        throw new BadRequestError(
          `Invoiced quantity exceeds the remaining quantity of order line ${line.id}`,
        );
      }
      await tx.documentLine.update({
        where: { tenantId_id: { tenantId, id: line.id } },
        data: { quantityInvoiced: { increment: quantities.get(line.id) as Decimal } },
      });
    }
    await closeIfFullyProcessed({ document: source, context, tx });
    return;
  }

  if (!INVOICEABLE_DELIVERY_NOTE_STATUSES.includes(source.status)) {
    throw new BadRequestError(`Delivery note in status ${source.status} cannot be invoiced`);
  }
  await lockDocumentStatus(tx, source);
  const noteLines = await loadLines(tx, tenantId, source.id, [...quantities.keys()]);
  const perOrderLine = new Map<string, Decimal>();
  for (const line of noteLines) {
    const quantity = quantities.get(line.id) as Decimal;
    if (quantity.greaterThan(line.quantity.minus(line.quantityInvoiced))) {
      throw new BadRequestError(
        `Invoiced quantity exceeds the remaining quantity of delivery note line ${line.id}`,
      );
    }
    await tx.documentLine.update({
      where: { tenantId_id: { tenantId, id: line.id } },
      data: { quantityInvoiced: { increment: quantity } },
    });
    await closeIfFullyProcessed({ document: source, context, tx });
    if (line.sourceLineId) {
      perOrderLine.set(
        line.sourceLineId,
        (perOrderLine.get(line.sourceLineId) ?? new Decimal(0)).plus(quantity),
      );
    }
  }
  if (perOrderLine.size === 0) return;

  const orderRelation = await tx.documentRelation.findFirst({
    where: { tenantId, targetDocumentId: source.id, relationType: "FULFILLS" },
    select: { sourceDocumentId: true },
  });
  if (!orderRelation) return;
  const order = await loadDocument(tx, orderRelation.sourceDocumentId, tenantId);
  await lockDocumentStatus(tx, order);
  const orderLines = await loadLines(tx, tenantId, order.id, [...perOrderLine.keys()]);
  for (const line of orderLines) {
    const quantity = perOrderLine.get(line.id) as Decimal;
    if (line.quantityInvoiced.plus(quantity).greaterThan(line.quantity)) {
      throw new BadRequestError(
        `Invoiced quantity exceeds the ordered quantity of order line ${line.id}`,
      );
    }
    await tx.documentLine.update({
      where: { tenantId_id: { tenantId, id: line.id } },
      data: { quantityInvoiced: { increment: quantity } },
    });
  }
  closeIfFullyProcessed({ document: order, context, tx });
}

/**
 * Applies a just-formalized credit note to the invoice it credits, increasing `quantityReturned`
 * (x <= quantity - returned). Stock and accounting effects are not handled yet.
 *
 * @throws BadRequestError when the invoice is not creditable or a quantity exceeds the remaining one
 */
export async function applyCreditNoteToInvoice(args: {
  creditNote: Document;
  tx: Prisma.TransactionClient;
}): Promise<void> {
  const { creditNote, tx } = args;
  const { tenantId } = creditNote;

  const relation = await tx.documentRelation.findFirst({
    where: { tenantId, sourceDocumentId: creditNote.id, relationType: "CREDITS" },
    select: { targetDocumentId: true },
  });
  if (!relation) return;

  const quantities = await sumQuantitiesBySource(tx, creditNote);
  if (quantities.size === 0) return;
  const invoice = await loadDocument(tx, relation.targetDocumentId, tenantId);
  if (invoice.documentType !== "INVOICE" || !CREDITABLE_INVOICE_STATUSES.includes(invoice.status)) {
    throw new BadRequestError(
      `A ${invoice.documentType} in status ${invoice.status} cannot be credited`,
    );
  }
  await lockDocumentStatus(tx, invoice);
  const lines = await loadLines(tx, tenantId, invoice.id, [...quantities.keys()]);
  for (const line of lines) {
    const quantity = quantities.get(line.id) as Decimal;
    if (quantity.greaterThan(line.quantity.minus(line.quantityReturned))) {
      throw new BadRequestError(
        `Credited quantity exceeds the remaining quantity of invoice line ${line.id}`,
      );
    }
    await tx.documentLine.update({
      where: { tenantId_id: { tenantId, id: line.id } },
      data: { quantityReturned: { increment: quantity } },
    });
  }
}
