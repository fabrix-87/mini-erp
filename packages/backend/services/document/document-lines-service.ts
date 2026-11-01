import { Prisma, type Document } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma-config";
import { MAX_DOCUMENT_LINES, type CreateDocumentLineInput } from "@mini-erp/shared";
import { BadRequestError, ConflictError, NotFoundError } from "@/utils/app-error-utils";
import type { DocumentCreateContext, DocumentLinePricingContext } from "@/types";
import { TRANSACTION_LIMITS_OPTIONS } from "@/types/document-types";
import { assertDocumentEditable, findDocumentOrThrow } from "./document-guards";
import { lockDocumentStatus } from "./document-concurrency";
import { buildDocumentLine } from "./document-line-builder";
import { resolveDocumentLinePricing } from "./document-line-pricing-service";
import { recalculateDocumentTotals } from "./document-totals-service";
import { resolveDocumentLinesTax } from "./document-line-tax-service";

/** Loads an editable document and locks it for the rest of the transaction (serializes line writers). */
async function loadEditableDocument(
  tx: Prisma.TransactionClient,
  documentId: string,
  context: DocumentCreateContext,
) {
  const document = await findDocumentOrThrow(tx, documentId, context.tenantId);
  assertDocumentEditable(document);
  await lockDocumentStatus(tx, document);
  return document;
}

/** Builds the pricing context from the persisted document (not from the request). */
function toPricingContext(document: Document): DocumentLinePricingContext {
  return {
    tenantId: document.tenantId,
    documentType: document.documentType,
    currencyCode: document.currencyCode,
    documentDate: document.documentDate,
    customerId: document.customerId,
  } satisfies DocumentLinePricingContext;
}

/** Applies document-level rules that the line schema cannot know. */
function assertLineAllowed(document: Document, line: CreateDocumentLineInput): void {
  if (line.matchStatus && document.documentType !== "SUPPLIER_INVOICE") {
    throw new BadRequestError("matchStatus is only allowed on supplier invoice lines");
  }
}

/** Runs a line mutation in a transaction and maps constraint violations to AppErrors. */
async function runLineTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  try {
    return await prisma.$transaction(fn, TRANSACTION_LIMITS_OPTIONS);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003")
        throw new BadRequestError(
          "A referenced record (variant, warehouse, tax rule or parent line) is not valid for this document",
        );
      if (error.code === "P2002") throw new ConflictError("Line number conflict, please retry");
    }
    throw error;
  }
}

/**
 * Converts a create input into a full-replace update: every nullable column absent
 * from the payload is explicitly cleared (undefined would leave the old value).
 */
function toReplaceData(
  c: Prisma.DocumentLineUncheckedCreateWithoutDocumentInput,
): Prisma.DocumentLineUncheckedUpdateInput {
  return {
    ...c,
    productVariantId: c.productVariantId ?? null,
    productId: c.productId ?? null,
    code: c.code ?? null,
    descriptionSystem: c.descriptionSystem ?? null,
    nameCustomer: c.nameCustomer ?? null,
    descriptionCustomer: c.descriptionCustomer ?? null,
    taxRuleId: c.taxRuleId ?? null,
    vatNatureCode: c.vatNatureCode ?? null,
    vatNormReference: c.vatNormReference ?? null,
    matchStatus: c.matchStatus ?? null,
    notes: c.notes ?? null,
    warehouseId: c.warehouseId ?? null,
    parentLineId: c.parentLineId ?? null,
    originalUnitPrice: c.originalUnitPrice ?? null,
    priceOverrideReason: c.priceOverrideReason ?? null,
  } satisfies Prisma.DocumentLineUncheckedUpdateInput;
}

/**
 * Appends a line to an editable document, resolving its price on the server and
 * recalculating the document totals in the same transaction.
 * @returns The created line and the updated document totals.
 */
export async function addDocumentLine(args: {
  documentId: string;
  input: CreateDocumentLineInput;
  context: DocumentCreateContext;
}) {
  const { documentId, input, context } = args;
  return runLineTransaction(async (tx) => {
    const document = await loadEditableDocument(tx, documentId, context);
    assertLineAllowed(document, input);

    const stats = await tx.documentLine.aggregate({
      where: { tenantId: document.tenantId, documentId },
      _max: { lineNumber: true },
      _count: { _all: true },
    });
    if (stats._count._all >= MAX_DOCUMENT_LINES) {
      throw new BadRequestError(`A document cannot have more than ${MAX_DOCUMENT_LINES} lines`);
    }

    const index = stats._max.lineNumber ?? 0;
    const pricingContext = toPricingContext(document);
    const pricing = await resolveDocumentLinePricing(tx, pricingContext, input);
    const [tax] = await resolveDocumentLinesTax(tx, pricingContext, [input]);
    const { prismaInput } = buildDocumentLine({ line: input, index, pricing, tax });

    const line = await tx.documentLine.create({
      data: {
        ...prismaInput,
        tenantId: document.tenantId,
        documentId,
      } satisfies Prisma.DocumentLineUncheckedCreateInput,
    });
    const totals = await recalculateDocumentTotals(
      tx,
      { documentId, tenantId: document.tenantId },
      context.userId,
    );
    return { line, totals };
  });
}

/**
 * Replaces a line with a full payload (same rules and pricing as creation), keeping its position.
 * Fulfillment quantities (delivered/invoiced/returned) are never touched.
 * @returns The updated line and the updated document totals.
 */
export async function replaceDocumentLine(args: {
  documentId: string;
  lineId: string;
  input: CreateDocumentLineInput;
  context: DocumentCreateContext;
}) {
  const { documentId, lineId, input, context } = args;
  return runLineTransaction(async (tx) => {
    const document = await loadEditableDocument(tx, documentId, context);
    assertLineAllowed(document, input);
    if (input.parentLineId === lineId) throw new BadRequestError("A line cannot be its own parent");

    const existing = await tx.documentLine.findFirst({
      where: { id: lineId, tenantId: document.tenantId, documentId },
    });
    if (!existing) throw new NotFoundError("Document line not found");
    
    const index = existing.lineNumber - 1;
    const pricingContext = toPricingContext(document);
    const pricing = await resolveDocumentLinePricing(tx, pricingContext, input);
    const [tax] = await resolveDocumentLinesTax(tx, pricingContext, [input]);
    const { prismaInput } = buildDocumentLine({ line: input, index, pricing, tax });

    const line = await tx.documentLine.update({
      where: { tenantId_id: { tenantId: document.tenantId, id: lineId }, documentId },
      data: toReplaceData(prismaInput),
    });
    const totals = await recalculateDocumentTotals(
      tx,
      { documentId, tenantId: document.tenantId },
      context.userId,
    );
    return { line, totals };
  });
}

/**
 * Removes a line, renumbers the following lines (ascending, one by one, because the
 * unique constraint is checked row by row [8]) and recalculates the totals.
 * A line that still has component lines cannot be removed.
 * @returns The updated document totals.
 */
export async function removeDocumentLine(args: {
  documentId: string;
  lineId: string;
  context: DocumentCreateContext;
}) {
  const { documentId, lineId, context } = args;
  return runLineTransaction(async (tx) => {
    const document = await loadEditableDocument(tx, documentId, context);
    const { tenantId } = document;

    const existing = await tx.documentLine.findFirst({
      where: { id: lineId, tenantId, documentId },
    });
    if (!existing) throw new NotFoundError("Document line not found");

    const components = await tx.documentLine.count({
      where: { tenantId, documentId, parentLineId: lineId },
    });
    if (components > 0) throw new BadRequestError("Remove the component lines first");

    await tx.documentLine.delete({ where: { tenantId_id: { tenantId, id: lineId }, documentId } });

    const following = await tx.documentLine.findMany({
      where: { tenantId, documentId, lineNumber: { gt: existing.lineNumber } },
      orderBy: { lineNumber: "asc" },
      select: { id: true, lineNumber: true },
    });
    for (const row of following) {
      await tx.documentLine.update({
        where: { tenantId_id: { tenantId, id: row.id } },
        data: { lineNumber: row.lineNumber - 1 },
      });
    }

    const totals = await recalculateDocumentTotals(tx, { documentId, tenantId }, context.userId);
    return { totals };
  });
}

/**
 * Reorders the lines of an editable document. The payload must contain every line exactly once.
 * Two phases (shift out of range, then assign) avoid transient unique violations.
 * @returns The lines with their new numbers.
 */
export async function reorderDocumentLines(args: {
  documentId: string;
  lineIds: string[];
  context: DocumentCreateContext;
}) {
  const { documentId, lineIds, context } = args;
  return runLineTransaction(async (tx) => {
    const document = await loadEditableDocument(tx, documentId, context);
    const { tenantId } = document;

    const current = await tx.documentLine.findMany({
      where: { tenantId, documentId },
      select: { id: true },
    });
    const currentIds = new Set(current.map((line) => line.id));
    if (lineIds.length !== currentIds.size || lineIds.some((id) => !currentIds.has(id))) {
      throw new BadRequestError("lineIds must contain every line of the document exactly once");
    }

    await tx.documentLine.updateMany({
      where: { tenantId, documentId },
      data: { lineNumber: { increment: MAX_DOCUMENT_LINES + 1 } },
    });
    for (const [index, id] of lineIds.entries()) {
      await tx.documentLine.update({
        where: { tenantId_id: { tenantId, id } },
        data: { lineNumber: index + 1 },
      });
    }
    await tx.document.update({
      where: { tenantId_id: { tenantId, id: documentId } },
      data: { updatedByUserId: context.userId },
    });

    return tx.documentLine.findMany({
      where: { tenantId, documentId },
      orderBy: { lineNumber: "asc" },
      select: { id: true, lineNumber: true },
    });
  });
}
