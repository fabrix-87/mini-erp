import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma-config";
import { isDocumentDeletable } from "@mini-erp/shared";
import { BadRequestError } from "@/utils/app-error-utils";
import type { DocumentCreateContext } from "@/types";
import { findDocumentOrThrow } from "./document-guards";
import { lockDocumentStatus } from "./document-concurrency";

/**
 * Soft-deletes a DRAFT document that never received a number.
 * Numbered or formalized documents must be voided instead.
 * @throws NotFoundError | BadRequestError | ConflictError
 */
export async function softDeleteDocument(args: {
  documentId: string;
  context: DocumentCreateContext;
}): Promise<void> {
  const { documentId, context } = args;
  await prisma.$transaction(async (tx) => {
    const document = await findDocumentOrThrow(tx, documentId, context.tenantId);
    if (
      !isDocumentDeletable(document.status, document.documentNumber) ||
      document.snapshotLockedAt
    ) {
      throw new BadRequestError(
        "Only draft documents without a number can be deleted; void the document instead",
      );
    }
    await lockDocumentStatus(tx, document);
    await tx.document.update({
      where: { tenantId_id: { tenantId: document.tenantId, id: document.id }, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedBy: context.userId,
        updatedByUserId: context.userId,
      } satisfies Prisma.DocumentUncheckedUpdateInput,
    });
  });
}
