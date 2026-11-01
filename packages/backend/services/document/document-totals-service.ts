import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma-config";
import { calculateDocumentTotals, Decimal } from "@mini-erp/shared";
import type { DocumentCreateContext, DocumentTotalsSummary } from "@/types";
import { assertDocumentEditable, findDocumentOrThrow } from "./document-guards";
import { lockDocumentStatus } from "./document-concurrency";
import { getDocumentDetail } from "./document-query-service";
import { ValidationError } from "@/utils/app-error-utils";

/**
 * Recomputes and persists the totals of a document from its persisted lines.
 * The caller must have verified editability and locked the document in the same transaction.
 * `netPayableAmount` equals `totalAmount` until withholding tax is implemented.
 */
export async function recalculateDocumentTotals(
  tx: Prisma.TransactionClient,
  target: { documentId: string; tenantId: string },
  userId: string,
): Promise<DocumentTotalsSummary> {
  const { documentId, tenantId } = target;
  const [document, lines] = await Promise.all([
    tx.document.findFirstOrThrow({
      where: { id: documentId, tenantId, deletedAt: null },
      select: { discountPercent: true },
    }),
    tx.documentLine.findMany({
      where: { tenantId, documentId },
      select: { lineTotal: true, taxAmount: true, taxPercent: true },
    }),
  ]);

  const zero = new Decimal(0);
  const totals =
    lines.length > 0
      ? calculateDocumentTotals({ lines, documentDiscountPercent: document.discountPercent })
      : {
          subtotal: zero,
          discountAmount: zero,
          taxableAmount: zero,
          taxAmount: zero,
          totalAmount: zero,
        };

  const summary: DocumentTotalsSummary = {
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    taxableAmount: totals.taxableAmount,
    taxAmount: totals.taxAmount,
    totalAmount: totals.totalAmount,
  };
  if (summary.totalAmount.isNegative())
    throw new ValidationError("Document total cannot be negative");

  await tx.document.update({
    where: { tenantId_id: { tenantId, id: documentId }, deletedAt: null },
    data: {
      subtotal: summary.subtotal,
      discountAmount: summary.discountAmount,
      taxableAmount: summary.taxableAmount,
      taxAmount: summary.taxAmount,
      totalAmount: summary.totalAmount,
      netPayableAmount: summary.totalAmount,
      updatedByUserId: userId,
    } satisfies Prisma.DocumentUncheckedUpdateInput,
  });

  return summary;
}

/**
 * Recalculates the totals of an editable document and returns its detail.
 * @throws NotFoundError | BadRequestError | ConflictError
 */
export async function recalculateDraftDocument(args: {
  documentId: string;
  context: DocumentCreateContext;
}) {
  const { documentId, context } = args;
  return prisma.$transaction(async (tx) => {
    const document = await findDocumentOrThrow(tx, documentId, context.tenantId);
    assertDocumentEditable(document);
    await lockDocumentStatus(tx, document);
    await recalculateDocumentTotals(tx, { documentId, tenantId: context.tenantId }, context.userId);
    return getDocumentDetail(documentId, context.tenantId, tx);
  });
}
