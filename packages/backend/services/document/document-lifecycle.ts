import type { Document, Prisma } from "@/generated/prisma/client";
import {
  DOCUMENT_TYPE_CONFIG,
  getDocumentFormalizationStatus,
  type DocumentStatus,
} from "@mini-erp/shared";
import type { DocumentCreateContext } from "@/types";

/**
 * Builds the audit and lifecycle fields to write with a status transition.
 * Lifecycle timestamps are set once and never overwritten. sentDate is intentionally
 * not handled here: it belongs to the send operation, which does not send emails yet.
 *
 * @param args - Transition data
 * @param args.document - Document before the transition
 * @param args.fromStatus - Previous status
 * @param args.targetStatus - New status
 * @param args.context - Tenant and authenticated user context
 * @returns Partial Prisma update input to merge into the document update
 */
export function buildLifecycleData(args: {
  document: Pick<
    Document,
    "documentType" | "approvedAt" | "invoicedAt" | "deliveredAt" | "closedAt"
  >;
  fromStatus: DocumentStatus;
  targetStatus: DocumentStatus;
  context: DocumentCreateContext;
}): Prisma.DocumentUncheckedUpdateInput {
  const { document, fromStatus, targetStatus, context } = args;
  const now = new Date();

  const isApproval =
    fromStatus === "PENDING_APPROVAL" && !["DRAFT", "REJECTED", "VOIDED"].includes(targetStatus);

  const isFormalization = targetStatus === getDocumentFormalizationStatus(document.documentType);
  const isFiscal = DOCUMENT_TYPE_CONFIG[document.documentType].requiresEInvoicing;

  return {
    updatedByUserId: context.userId,
    ...(isApproval &&
      !document.approvedAt && {
        approvedAt: now,
        approvedByUserId: context.userId,
      }),
    ...(isFormalization && isFiscal && !document.invoicedAt && { invoicedAt: now }),
    ...(targetStatus === "DELIVERED" && !document.deliveredAt && { deliveredAt: now }),
    ...(targetStatus === "CLOSED" && !document.closedAt && { closedAt: now }),
  } satisfies Prisma.DocumentUncheckedUpdateInput;
}
