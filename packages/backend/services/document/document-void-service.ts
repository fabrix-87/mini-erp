import type { Document } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma-config";
import { canDocumentTypeBeVoided, canTransition, DOCUMENT_CONVERSION_MAP } from "@mini-erp/shared";
import { BadRequestError } from "@/utils/app-error-utils";
import type { DocumentCreateContext } from "@/types";
import { findDocumentOrThrow } from "./document-guards";
import { lockDocumentStatus } from "./document-concurrency";
import { buildLifecycleData } from "./document-lifecycle";
import { createStatusHistory } from "./document-status-history";

/**
 * Voids a formalized document. VOIDED is system-driven, so it is reachable only here.
 * In one transaction it validates the transition, refuses documents with payments or
 * installments already in a payment batch, cancels the open installments, writes voidedAt,
 * voidedReason and the status history. Stock reservations, movements and journal entries are
 * NOT handled yet.
 *
 * @param args - Document ID, mandatory reason and context
 * @returns The voided document
 * @throws NotFoundError | BadRequestError | ConflictError
 */
export async function voidDocument(args: {
  documentId: string;
  reason: string;
  context: DocumentCreateContext;
}): Promise<Document> {
  const { documentId, context } = args;
  const reason = args.reason.trim();
  if (!reason) throw new BadRequestError("A reason is required to void a document");

  return prisma.$transaction(async (tx) => {
    const document = await findDocumentOrThrow(tx, documentId, context.tenantId);

    if (!canDocumentTypeBeVoided(document.documentType)) {
      const creditNote = DOCUMENT_CONVERSION_MAP[document.documentType].find(
        (type) => type === "CREDIT_NOTE" || type === "SUPPLIER_CREDIT_NOTE",
      );
      throw new BadRequestError(
        `${document.documentType} documents cannot be voided` +
          (creditNote ? `; issue a ${creditNote} instead` : ""),
      );
    }
    if (!canTransition(document.documentType, document.status, "VOIDED")) {
      throw new BadRequestError(`A document in status ${document.status} cannot be voided`);
    }

    if (document.vatRegisterProtocol !== null) {
      throw new BadRequestError("A document registered in the VAT ledger cannot be voided");
    }

    await lockDocumentStatus(tx, document);

    const blocking = await tx.documentPaymentInstallment.count({
      where: {
        tenantId: document.tenantId,
        documentId,
        OR: [
          { status: { in: ["PAID", "PARTIAL"] } },
          { paidAmount: { gt: 0 } },
          { paymentBatchId: { not: null } },
        ],
      },
    });
    if (blocking > 0 || document.paidAmount.gt(0)) {
      throw new BadRequestError(
        "Documents with payments or installments in a payment batch cannot be voided",
      );
    }

    await tx.documentPaymentInstallment.updateMany({
      where: { tenantId: document.tenantId, documentId, status: { in: ["PENDING", "OVERDUE"] } },
      data: { status: "CANCELLED" },
    });

    const updated = await tx.document.update({
      where: { tenantId_id: { tenantId: document.tenantId, id: document.id }, deletedAt: null },
      data: {
        status: "VOIDED",
        voidedReason: reason,
        ...buildLifecycleData({
          document,
          fromStatus: document.status,
          targetStatus: "VOIDED",
          context,
        }),
      },
    });

    await createStatusHistory({
      documentId,
      fromStatus: document.status,
      toStatus: "VOIDED",
      context,
      reason,
      tx,
    });
    return updated;
  });
}
