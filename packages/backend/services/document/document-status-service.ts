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
import type { DocumentCreateContext } from "@/types";
import { lockDocumentStatus } from "./document-concurrency";

/** Arguments required to transition a document status. */
export interface TransitionDocumentStatusArgs {
  /** ID of the document to transition. */
  documentId: string;

  /** Target status requested by the caller. */
  targetStatus: DocumentStatus;

  /** Tenant and authenticated user context. */
  context: DocumentCreateContext;
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

    assertTransitionIsAllowed({
      documentType: document.documentType,
      currentStatus: document.status,
      targetStatus,
    });

    await lockDocumentStatus(tx, document);

    if (targetStatus !== getDocumentFormalizationStatus(document.documentType)) {
      return updateDocumentStatus({
        documentId: document.id,
        fromStatus: document.status,
        targetStatus,
        context,
        tx,
      });
    }

    assertCanBeFormalized(document);

    return formalizeDocument({ document, targetStatus, context, tx });
  });
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
  documentId: string;
  fromStatus: DocumentStatus;
  targetStatus: DocumentStatus;
  context: DocumentCreateContext;
  tx: Prisma.TransactionClient;
}): Promise<Document> {
  const { documentId, fromStatus, targetStatus, context, tx } = args;

  const document = await tx.document.update({
    where: { id: documentId },
    data: {
      status: targetStatus,
    },
  });

  await createStatusHistory({
    documentId,
    fromStatus,
    toStatus: targetStatus,
    context,
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
  tx: Prisma.TransactionClient;
}): Promise<Document> {
  const { document, targetStatus, context, tx } = args;

  const numbering = isOutboundDocumentType(document.documentType)
    ? await generateDocumentNumber(
        document.documentType,
        document.tenantId,
        document.documentYear,
        tx,
      )
    : undefined;

  const snapshots = await resolveDocumentFormalizationSnapshots(
    document satisfies ResolveSnapshotsDocument,
    context,
    tx,
  );

  const data = buildDocumentFormalizationData({
    documentType: document.documentType,
    snapshots,
    numbering,
  });

  const updatedDocument = await tx.document.update({
    where: { id: document.id },
    data,
  });

  await createStatusHistory({
    documentId: document.id,
    fromStatus: document.status,
    toStatus: targetStatus,
    context,
    tx,
  });

  return updatedDocument;
}

/**
 * Creates an immutable status-history entry for a document transition.
 *
 * @param args - History context
 * @param args.documentId - Document ID
 * @param args.fromStatus - Previous status
 * @param args.toStatus - New status
 * @param args.context - Tenant and authenticated user context
 * @param args.tx - Prisma transaction client
 */
export async function createStatusHistory(args: {
  documentId: string;
  fromStatus: DocumentStatus;
  toStatus: DocumentStatus;
  context: DocumentCreateContext;
  tx: Prisma.TransactionClient;
}): Promise<void> {
  const { documentId, fromStatus, toStatus, context, tx } = args;

  await tx.documentStatusHistory.create({
    data: {
      documentId,
      fromStatus,
      toStatus,
      changedBy: context.userId,
    },
  });
}
