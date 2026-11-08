import { Document, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma-config";
import {
  DOCUMENT_TYPE_STATUS_TRANSITIONS,
  getDocumentFormalizationStatus,
  isDocumentEditable,
  isOutboundDocumentType,
  isSystemDrivenStatus,
  type DocumentStatus,
  type DocumentType,
} from "@mini-erp/shared";
import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import { generateDocumentNumber } from "./document-numbering";
import {
  resolveDocumentFormalizationSnapshots,
  type ResolveSnapshotsDocument,
} from "./document-formalization-snapshot-service";
import { buildDocumentFormalizationData } from "./document-formalization-builder";
import { TRANSACTION_LIMITS_OPTIONS, type DocumentCreateContext } from "@/types";
import { lockDocumentStatus } from "./document-concurrency";
import { buildLifecycleData } from "./document-lifecycle";
import {
  assertDocumentReadyForFormalization,
  assertSnapshotsAreComplete,
} from "./document-formalization-validation";
import { createStatusHistory } from "./document-status-history";
import { applyDeliveryNoteToOrder } from "./document-fulfillment";
import { applyCreditNoteToInvoice, applyInvoiceToSources } from "./document-invoicing";

/** Arguments required to transition a document status. */
export interface TransitionDocumentStatusArgs {
  /** ID of the document to transition. */
  documentId: string;

  /** Target status requested by the caller. */
  targetStatus: DocumentStatus;

  /** Tenant and authenticated user context. */
  context: DocumentCreateContext;

  /** Operator note; mandatory when rejecting a document. */
  reason?: string | null;

  /** When set, the document must currently be in this status (checked inside the transaction). */
  expectedCurrentStatus?: DocumentStatus;

  /** True only for the approve/reject operations: the generic transition cannot leave PENDING_APPROVAL except back to DRAFT. */
  viaApprovalWorkflow?: boolean;
}

/**
 * Transitions a document to the requested status.
 *
 * When the target status is the formalization status of the document type,
 * the service generates the document number for OUTBOUND documents, resolves
 * immutable snapshots and locks them, all inside the same transaction.
 *
 * @param args - Document ID, target status and authenticated context
 * @returns The updated document
 * @throws NotFoundError when the document does not exist
 * @throws BadRequestError when the transition is not allowed
 */
export async function transitionDocumentStatus(
  args: TransitionDocumentStatusArgs,
): Promise<Document> {
  const { documentId, targetStatus, context } = args;

  const reason = args.reason?.trim() || undefined;
  if (targetStatus === "REJECTED" && !reason) {
    throw new BadRequestError("A reason is required to reject a document");
  }

  if (isSystemDrivenStatus(targetStatus)) {
    throw new BadRequestError(`Status ${targetStatus} cannot be requested manually`);
  }

  return prisma.$transaction(async (tx) => {
    const document = await tx.document.findFirst({
      where: withSoftDelete(withTenantId({ id: documentId }, context.tenantId)),
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    if (args.expectedCurrentStatus && document.status !== args.expectedCurrentStatus) {
      throw new BadRequestError(
        `Document must be in status ${args.expectedCurrentStatus}, found ${document.status}`,
      );
    }

    if (
      !args.viaApprovalWorkflow &&
      document.status === "PENDING_APPROVAL" &&
      targetStatus !== "DRAFT"
    ) {
      throw new BadRequestError("Use the approve or reject operations to leave PENDING_APPROVAL");
    }

    assertTransitionIsAllowed({
      documentType: document.documentType,
      currentStatus: document.status,
      targetStatus,
    });

    await lockDocumentStatus(tx, document);

    if (targetStatus !== getDocumentFormalizationStatus(document.documentType)) {
      return updateDocumentStatus({
        current: document,
        fromStatus: document.status,
        targetStatus,
        reason,
        context,
        tx,
      });
    }

    assertCanBeFormalized(document);

    return formalizeDocument({ document, targetStatus, reason, context, tx });
  }, TRANSACTION_LIMITS_OPTIONS);
}

/**
 * Ensures that a document can still be formalized.
 * Formalization is only allowed from the draft phase and only once.
 *
 * @param document - Document to formalize
 * @throws BadRequestError when the document is outside the draft phase or already formalized
 */
function assertCanBeFormalized(document: Document): void {
  if (!isDocumentEditable(document.status)) {
    throw new BadRequestError(`Document in status ${document.status} cannot be formalized`);
  }

  if (document.snapshotLockedAt) {
    throw new BadRequestError("Document has already been formalized");
  }
}

/**
 * Ensures that the requested transition is allowed for the document type.
 *
 * @param args - Transition context
 * @param args.documentType - Document type
 * @param args.currentStatus - Current document status
 * @param args.targetStatus - Requested target status
 * @throws BadRequestError when the transition is not allowed
 */
function assertTransitionIsAllowed(args: {
  documentType: DocumentType;
  currentStatus: DocumentStatus;
  targetStatus: DocumentStatus;
}): void {
  const { documentType, currentStatus, targetStatus } = args;

  const allowedStatuses = DOCUMENT_TYPE_STATUS_TRANSITIONS[documentType][currentStatus] ?? [];

  if (!allowedStatuses.includes(targetStatus)) {
    throw new BadRequestError(
      `Transition from ${currentStatus} to ${targetStatus} is not allowed for ${documentType}`,
    );
  }
}

/**
 * Applies a non-formalization status transition and records its history.
 *
 * @param args - Transition context
 * @param args.documentId - Document ID
 * @param args.fromStatus - Current document status
 * @param args.targetStatus - Target document status
 * @param args.context - Tenant and authenticated user context
 * @param args.tx - Prisma transaction client
 * @returns The updated document
 */
async function updateDocumentStatus(args: {
  current: Document;
  fromStatus: DocumentStatus;
  targetStatus: DocumentStatus;
  context: DocumentCreateContext;
  reason: string | undefined;
  tx: Prisma.TransactionClient;
}): Promise<Document> {
  const { current, fromStatus, targetStatus, context, reason, tx } = args;

  const document = await tx.document.update({
    where: { id: current.id },
    data: {
      status: targetStatus,
      ...buildLifecycleData({ document: current, fromStatus, targetStatus, context }),
    },
  });

  await createStatusHistory({
    documentId: current.id,
    fromStatus,
    toStatus: targetStatus,
    context,
    reason,
    tx,
  });

  return document;
}

/**
 * Formalizes a document: generates its number when OUTBOUND, resolves
 * immutable snapshots and locks them.
 *
 * @param args - Formalization context
 * @param args.document - Document being formalized
 * @param args.targetStatus - Formalization status
 * @param args.context - Tenant and authenticated user context
 * @param args.tx - Prisma transaction client
 * @returns The formalized document
 */
async function formalizeDocument(args: {
  document: Document;
  targetStatus: DocumentStatus;
  context: DocumentCreateContext;
  reason?: string;
  tx: Prisma.TransactionClient;
}): Promise<Document> {
  const { document, targetStatus, context, reason, tx } = args;

  await assertDocumentReadyForFormalization(document, tx);

  const snapshots = await resolveDocumentFormalizationSnapshots(
    document satisfies ResolveSnapshotsDocument,
    context,
    tx,
  );
  assertSnapshotsAreComplete(document.documentType, snapshots);

  const numbering = isOutboundDocumentType(document.documentType)
    ? await generateDocumentNumber(
        document.documentType,
        document.tenantId,
        document.documentYear,
        tx,
      )
    : undefined;

  const data = buildDocumentFormalizationData({
    documentType: document.documentType,
    snapshots,
    numbering,
  });

  const updatedDocument = await tx.document.update({
    where: { id: document.id },
    data: {
      ...data,
      ...buildLifecycleData({ document, fromStatus: document.status, targetStatus, context }),
    },
  });

  await createStatusHistory({
    documentId: document.id,
    fromStatus: document.status,
    toStatus: targetStatus,
    context,
    reason,
    tx,
  });

  switch (updatedDocument.documentType) {
    case "DELIVERY_NOTE":
      await applyDeliveryNoteToOrder({ deliveryNote: updatedDocument, context, tx });
      break;
    case "INVOICE":
      await applyInvoiceToSources({ invoice: updatedDocument, tx });
      break;
    case "CREDIT_NOTE":
      await applyCreditNoteToInvoice({ creditNote: updatedDocument, tx });
      break;
  }

  return updatedDocument;
}
