import type { Document, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma-config";
import { getDocumentFormalizationStatus } from "@mini-erp/shared";
import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import type { DocumentCreateContext } from "@/types";
import { transitionDocumentStatus } from "./document-status-service";

/**
 * Approves a document waiting for approval by moving it to the formalization
 * status of its type (number, snapshots and lock are handled by the transition).
 * The document type is immutable, so reading it outside the transaction is safe;
 * the current status is verified atomically inside the transition.
 *
 * @param args - Document ID, optional approval note (stored in the status history) and context
 * @returns The formalized document
 * @throws NotFoundError | BadRequestError | ConflictError
 */
export async function approveDocument(args: {
  documentId: string;
  notes?: string | null;
  context: DocumentCreateContext;
}): Promise<Document> {
  const { documentId, notes, context } = args;

  const document = await prisma.document.findFirst({
    where: withSoftDelete(
      withTenantId({ id: documentId }, context.tenantId),
    ) as Prisma.DocumentWhereInput,
    select: { documentType: true },
  });
  if (!document) throw new NotFoundError("Document not found");

  const targetStatus = getDocumentFormalizationStatus(document.documentType);
  if (!targetStatus) throw new BadRequestError(`${document.documentType} has no approval workflow`);

  return transitionDocumentStatus({
    documentId,
    targetStatus,
    expectedCurrentStatus: "PENDING_APPROVAL",
    viaApprovalWorkflow: true,
    reason: notes,
    context,
  });
}

/**
 * Rejects a document waiting for approval (PENDING_APPROVAL → REJECTED). The reason is mandatory
 * and is stored in the status history. This is the only way out of PENDING_APPROVAL other than
 * going back to DRAFT: the generic status endpoint cannot be used for it. A rejection by the
 * customer of an already sent document goes through the generic status transition instead.
 *
 * @param args - Document ID, mandatory reason and context
 * @returns The rejected document
 * @throws NotFoundError when the document does not exist
 * @throws BadRequestError when the reason is empty, the document is not in PENDING_APPROVAL
 * or the transition is not allowed for its type
 */
export async function rejectDocument(args: {
  documentId: string;
  reason: string;
  context: DocumentCreateContext;
}): Promise<Document> {
  return transitionDocumentStatus({
    documentId: args.documentId,
    targetStatus: "REJECTED",
    expectedCurrentStatus: "PENDING_APPROVAL",
    viaApprovalWorkflow: true,
    reason: args.reason,
    context: args.context,
  });
}
