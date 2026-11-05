import type { Prisma } from "@/generated/prisma/client";
import type { DocumentStatus } from "@mini-erp/shared";
import type { DocumentCreateContext } from "@/types";

/**
 * Creates an immutable status-history entry for a document transition.
 *
 * @param args - History context
 * @param args.documentId - Document ID
 * @param args.fromStatus - Previous status
 * @param args.toStatus - New status
 * @param args.context - Tenant and authenticated user context
 * @param args.tx - Prisma transaction client
 * @param args.reason - Optional operator note
 */
export async function createStatusHistory(args: {
  documentId: string;
  fromStatus: DocumentStatus;
  toStatus: DocumentStatus;
  context: DocumentCreateContext;
  tx: Prisma.TransactionClient;
  reason?: string | null;
}): Promise<void> {
  const { documentId, fromStatus, toStatus, context, reason, tx } = args;
  await tx.documentStatusHistory.create({
    data: {
      documentId,
      reason: reason ?? undefined,
      fromStatus,
      toStatus,
      changedBy: context.userId,
    },
  });
}
