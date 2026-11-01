import type { Document, Prisma } from "@/generated/prisma/client";
import { isDocumentEditable } from "@mini-erp/shared";
import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";

/**
 * Loads a non-deleted document of the given tenant inside a transaction.
 * @throws NotFoundError when the document does not exist for this tenant.
 */
export async function findDocumentOrThrow(
  tx: Prisma.TransactionClient,
  documentId: string,
  tenantId: string,
): Promise<Document> {
  const document = await tx.document.findFirst({
    where: withSoftDelete(withTenantId({ id: documentId }, tenantId)) as Prisma.DocumentWhereInput,
  });
  if (!document) throw new NotFoundError("Document not found");
  return document;
}

/**
 * Ensures a document is in the draft phase and not yet formalized.
 * @throws BadRequestError when the document is immutable.
 */
export function assertDocumentEditable(
  document: Pick<Document, "status" | "snapshotLockedAt">,
): void {
  if (!isDocumentEditable(document.status) || document.snapshotLockedAt) {
    throw new BadRequestError(`Document in status ${document.status} cannot be modified`);
  }
}
