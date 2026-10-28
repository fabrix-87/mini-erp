import type { Document, Prisma } from "@/generated/prisma/client";
import { ConflictError } from "@/utils/app-error-utils";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";

/**
 * Locks a document row for the rest of the transaction and verifies that its status
 * has not changed since it was read. Prevents concurrent transitions (for example two
 * formalizations consuming two document numbers).
 *
 * @param tx - Prisma transaction client
 * @param document - Document as previously read inside the same transaction
 * @throws ConflictError when the document was modified or removed concurrently
 */
export async function lockDocumentStatus(
  tx: Prisma.TransactionClient,
  document: Pick<Document, "id" | "tenantId" | "status">,
): Promise<void> {
  const { count } = await tx.document.updateMany({
    where: withSoftDelete(
      withTenantId({ id: document.id, status: document.status }, document.tenantId),
    ),
    data: { status: document.status },
  });

  if (count !== 1) {
    throw new ConflictError("Document was modified concurrently, please retry");
  }
}
