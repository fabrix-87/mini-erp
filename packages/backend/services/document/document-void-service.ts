import type { Document } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma-config";
import { canDocumentTypeBeVoided, canTransition } from "@mini-erp/shared";
import { BadRequestError } from "@/utils/app-error-utils";
import type { DocumentCreateContext } from "@/types";
import { findDocumentOrThrow } from "./document-guards";
import { lockDocumentStatus } from "./document-concurrency";
import { buildLifecycleData } from "./document-lifecycle";
import { createStatusHistory } from "./document-status-service";

/**
 * Voids a formalized document. VOIDED is a system-driven status, so it can only be
 * reached through this operation, which requires a non-empty reason.
 * Writes voidedAt, voidedReason, updatedByUserId and a status-history entry atomically.
 * Side effects on installments, stock reservations and e-invoicing are NOT handled yet.
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
      throw new BadRequestError(`${document.documentType} documents cannot be voided`);
    }
    if (!canTransition(document.documentType, document.status, "VOIDED")) {
      throw new BadRequestError(`A document in status ${document.status} cannot be voided`);
    }

    await lockDocumentStatus(tx, document);

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
