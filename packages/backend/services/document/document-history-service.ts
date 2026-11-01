import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma-config";
import { NotFoundError } from "@/utils/app-error-utils";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";

/**
 * Returns the status history of a document, oldest first.
 * @param documentId - Document CUID
 * @param tenantId - Current tenant ID
 * @throws NotFoundError when the document does not exist for this tenant
 */
export async function getDocumentStatusHistory(documentId: string, tenantId: string) {
  const document = await prisma.document.findFirst({
    where: withSoftDelete(withTenantId({ id: documentId }, tenantId)) as Prisma.DocumentWhereInput,
    select: { id: true },
  });
  if (!document) throw new NotFoundError("Document not found");

  return prisma.documentStatusHistory.findMany({
    where: { documentId },
    orderBy: [{ changedAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      reason: true,
      changedAt: true,
      changedBy: true,
      user: { select: { id: true, username: true, email: true } },
    },
  });
}
