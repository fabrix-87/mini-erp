import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma-config";
import { calculateDocumentTotals, Decimal } from "@mini-erp/shared";
import type { DocumentCreateContext } from "@/types";
import { assertDocumentEditable, findDocumentOrThrow } from "./document-guards";
import { lockDocumentStatus } from "./document-concurrency";
import { getDocumentDetail } from "./document-query-service";

/**
 * Recomputes and persists the totals of a document from its persisted lines.
 * The caller must have verified editability and locked the document in the same transaction.
 * `netPayableAmount` equals `totalAmount` until withholding tax is implemented.
 */
export async function recalculateDocumentTotals(
  tx: Prisma.TransactionClient,
  target: { documentId: string; tenantId: string },
  userId: string,
): Promise<void> {
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

  await tx.document.update({
    where: { tenantId_id: { tenantId, id: documentId }, deletedAt: null },
    data: {
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxableAmount: totals.taxableAmount,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      netPayableAmount: totals.totalAmount,
      updatedByUserId: userId,
    } satisfies Prisma.DocumentUncheckedUpdateInput,
  });
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
