import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { sendFail, sendSuccess } from "@/utils/response-utils";
import {
  ApproveDocumentInput,
  DocumentIdParam,
  DocumentStatus,
  DocumentType,
  RejectDocumentInput,
  SendDocumentInput,
  STATUSES_REQUIRING_NUMBER,
  UpdateDocumentStatusInput,
} from "@mini-erp/shared";
import { getDocumentSelection } from "@/helpers/document";
import { generateDocumentNumber, resolveAllowedTransitions } from "@/services/document";
import { connectOrDisconnectById, toIntId, withSoftDelete } from "@/helpers/prisma-helper";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { getValidatedBody, getValidatedParams } from "@/helpers/validated-context";

// ============================================================================
// STATUS MANAGEMENT
// ============================================================================

/**
 * Generic status update with transition validation.
 * Validates allowed transitions per document type before applying change.
 * Auto-generates document number when transitioning to a status that requires it.
 * @route PATCH /api/documents/:id/status
 * @access Private
 */
export const updateDocumentStatus = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const {
    status: newStatus,
    reason,
    voidedReason,
  } = getValidatedBody<UpdateDocumentStatusInput>(c);
  const userId = c.get("user")!.userId;

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: {
      id: true,
      status: true,
      documentType: true,
      tenantId: true,
      documentNumber: true,
      companyId: true,
      documentYear: true,
    },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  const allowed = resolveAllowedTransitions(
    document.documentType as DocumentType,
    document.status as DocumentStatus,
  );

  if (!allowed.includes(newStatus as DocumentStatus)) {
    throw new BadRequestError(`Transizione non permessa: ${document.status} → ${newStatus}`);
  }

  // Auto-generate document number when needed
  const needsNumber =
    STATUSES_REQUIRING_NUMBER.includes(newStatus as DocumentStatus) && !document.documentNumber;

  const updatedDocument = await prisma.$transaction(async (tx) => {
    const updateData: Prisma.DocumentUpdateInput = {
      status: newStatus,
      ...(reason && { internalNotes: reason }),
      ...(voidedReason && { voidedReason }),
      // Timestamp fields per status
      ...(newStatus === "SENT" && { sentDate: new Date() }),
      ...(newStatus === "ACCEPTED" && { approvedAt: new Date() }),
      ...(newStatus === "DELIVERED" && { deliveredAt: new Date() }),
      ...(newStatus === "PAID" && { invoicedAt: new Date() }),
      ...(newStatus === "VOIDED" && { voidedAt: new Date() }),
      ...(newStatus === "CLOSED" && { closedAt: new Date() }),
    };

    if (needsNumber) {
      const { documentNumber, sequenceNumber } = await generateDocumentNumber(
        document.documentType as DocumentType,
        document.tenantId,
        document.documentYear,
        tx,
      );

      updateData.documentNumber = documentNumber;
      updateData.sequenceNumber = sequenceNumber;
    }

    return tx.document.update({
      where: { id: toIntId(id) },
      data: updateData,
      select: getDocumentSelection(),
    });
  });

  return sendSuccess(c, updatedDocument, {
    message: `Stato aggiornato: ${newStatus}`,
  });
};

// ============================================================================
// APPROVAL WORKFLOW
// ============================================================================

/**
 * Approves a document in PENDING_APPROVAL status.
 * Transitions to ACCEPTED and records approval timestamp.
 * @route POST /api/documents/:id/approve
 * @access Private
 */
export const approveDocument = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const { notes } = getValidatedBody<ApproveDocumentInput>(c);
  const userId = c.get("user")!.userId;

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: { id: true, status: true, documentType: true },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  const allowed = resolveAllowedTransitions(
    document.documentType as DocumentType,
    document.status as DocumentStatus,
  );

  if (!allowed.includes("ACCEPTED")) {
    throw new BadRequestError(`Approvazione non permessa dallo stato: ${document.status}`);
  }

  const updated = await prisma.document.update({
    where: { id: toIntId(id) },
    data: {
      status: "ACCEPTED",
      approvedAt: new Date(),
      assignedUser: connectOrDisconnectById(userId),
      ...(notes && { internalNotes: notes }),
    },
    select: getDocumentSelection(),
  });

  return sendSuccess(c, updated, { message: "Documento approvato con successo" });
};

/**
 * Rejects a document in PENDING_APPROVAL status.
 * Transitions to REJECTED and records the mandatory rejection reason.
 * @route POST /api/documents/:id/reject
 * @access Private
 */
export const rejectDocument = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const { reason } = getValidatedBody<RejectDocumentInput>(c);
  const userId = c.get("user")!.userId;

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: { id: true, status: true, documentType: true },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  const allowed = resolveAllowedTransitions(
    document.documentType as DocumentType,
    document.status as DocumentStatus,
  );

  if (!allowed.includes("REJECTED")) {
    throw new BadRequestError(`Rifiuto non permesso dallo stato: ${document.status}`);
  }

  const updated = await prisma.document.update({
    where: { id: toIntId(id) },
    data: {
      status: "REJECTED",
      voidedReason: reason,
      assignedUser: connectOrDisconnectById(userId),
    },
    select: getDocumentSelection(),
  });

  return sendSuccess(c, updated, { message: "Documento rifiutato" });
};

/**
 * Voids a document. Only document types with canBeVoided=true are eligible.
 * Requires a voided reason (enforced by validator).
 * @route POST /api/documents/:id/void
 * @access Private
 */
export const voidDocument = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const data = getValidatedBody<UpdateDocumentStatusInput>(c);
  const userId = c.get("user")!.userId;

  if(data.status !== "VOIDED"){
    throw new NotFoundError("Status non valido");
  }

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: { id: true, status: true, documentType: true },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  const allowed = resolveAllowedTransitions(
    document.documentType as DocumentType,
    document.status as DocumentStatus,
  );

  if (!allowed.includes("VOIDED")) {
    throw new BadRequestError(`Annullamento non permesso dallo stato: ${document.status}`);
  }

  const updated = await prisma.document.update({
    where: { id: toIntId(id) },
    data: {
      status: "VOIDED",
      voidedAt: new Date(),
      voidedReason: data.voidedReason,
      assignedUser: connectOrDisconnectById(userId),
    },
    select: getDocumentSelection(),
  });

  return sendSuccess(c, updated, { message: "Documento annullato" });
};

// ============================================================================
// SEND
// ============================================================================

/**
 * Sends a document via email and transitions it to SENT status.
 * Auto-generates document number if not already assigned.
 * @route POST /api/documents/:id/send
 * @access Private
 */
export const sendDocument = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const sendData = getValidatedBody<SendDocumentInput>(c);

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: {
      id: true,
      status: true,
      documentType: true,
      documentNumber: true,
      tenantId: true,
      documentYear: true,
    },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  const allowed = resolveAllowedTransitions(
    document.documentType as DocumentType,
    document.status as DocumentStatus,
  );

  if (!allowed.includes("SENT")) {
    throw new BadRequestError(`Invio non permesso dallo stato: ${document.status}`);
  }

  return sendFail(c, {
    statusCode: 501,
    message: "Non ancora implementato"
  });
  /*
  const updated = await prisma.$transaction(async (tx) => {
    const updateData: Prisma.DocumentUpdateInput = {
      status: "SENT",
      sentDate: new Date(),
    };

    // Auto-generate number on first send if missing
    if (!document.documentNumber) {
      const { documentNumber, sequenceNumber } = await generateDocumentNumber(
        document.documentType as DocumentType,
        document.tenantId,
        document.documentYear,
        tx,
      );

      updateData.documentNumber = documentNumber;
      updateData.sequenceNumber = sequenceNumber;
    }

    return tx.document.update({
      where: { id: toIntId(id) },
      data: updateData,
      select: getDocumentSelection(),
    });
  });

  // TODO: integrate email service (sendData contains recipientEmail, subject, message, cc, bcc, attachPDF, attachXML)

  return sendSuccess(c, updated, {
    message: `Documento inviato a ${sendData.recipientEmail}`,
  });
  */
};

// ============================================================================
// STATUS HISTORY
// ============================================================================

/**
 * Returns the status change history for a document.
 * History is stored in the statusHistory JSON field.
 * @route GET /api/documents/:id/history
 * @access Private
 */
export const getDocumentHistory = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: { statusHistory: true },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  // statusHistory is a JSON field; return empty array if not populated yet
  const history = Array.isArray(document.statusHistory) ? document.statusHistory : [];

  return sendSuccess(c, history, { results: history.length });
};
