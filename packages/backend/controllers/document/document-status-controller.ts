import type { Context } from "hono";
import type { AppBindings } from "@/lib/hono-app";
import type {
  ApproveDocumentInput,
  DocumentIdParam,
  RejectDocumentInput,
  UpdateDocumentStatusInput,
  VoidDocumentInput,
} from "@mini-erp/shared";
import { getValidatedBody, getValidatedParams } from "@/helpers/validated-context";
import { requireDocumentContext } from "@/helpers/document/document-context";
import { sendFail, sendSuccess } from "@/utils/response-utils";
import {
  approveDocument as approveDocumentService,
  getDocumentStatusHistory,
  rejectDocument as rejectDocumentService,
  transitionDocumentStatus,
  voidDocument as voidDocumentService,
} from "@/services/document";

/**
 * Applies a generic status transition (formalizes the document when the target is
 * the formalization status of its type).
 * @route PATCH /api/documents/:id/status
 * @access Private (document:update | document:manage)
 * @param c - Hono context
 */
export const updateDocumentStatus = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const { status, reason } = getValidatedBody<UpdateDocumentStatusInput>(c);
  const document = await transitionDocumentStatus({
    documentId: id,
    targetStatus: status,
    reason,
    context,
  });
  return sendSuccess(c, document, { message: `Stato aggiornato: ${status}` });
};

/**
 * Approves a document in PENDING_APPROVAL (formalizes it).
 * @route POST /api/documents/:id/approve
 * @access Private (document:approve | document:manage)
 * @param c - Hono context
 */
export const approveDocument = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const { notes } = getValidatedBody<ApproveDocumentInput>(c);
  const document = await approveDocumentService({ documentId: id, notes, context });
  return sendSuccess(c, document, { message: "Documento approvato con successo" });
};

/**
 * Rejects a document; the reason is mandatory.
 * @route POST /api/documents/:id/reject
 * @access Private (document:approve | document:manage)
 * @param c - Hono context
 */
export const rejectDocument = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const { reason } = getValidatedBody<RejectDocumentInput>(c);
  const document = await rejectDocumentService({ documentId: id, reason, context });
  return sendSuccess(c, document, { message: "Documento rifiutato" });
};

/**
 * Voids a formalized document; the reason is mandatory.
 * @route POST /api/documents/:id/void
 * @access Private (document:void | document:manage)
 * @param c - Hono context
 */
export const voidDocument = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const { voidedReason } = getValidatedBody<VoidDocumentInput>(c);
  const document = await voidDocumentService({ documentId: id, reason: voidedReason, context });
  return sendSuccess(c, document, { message: "Documento annullato" });
};

/**
 * Email sending is not implemented: always responds 501 and never changes the
 * document or its sentDate. TODO: implement with the email service.
 * @route POST /api/documents/:id/send
 * @access Private (document:update | document:manage)
 * @param c - Hono context
 */
export const sendDocument = async (c: Context<AppBindings>) =>
  sendFail(c, { statusCode: 501, message: "Invio email non ancora implementato" });

/**
 * Returns the status history of a document, oldest first.
 * @route GET /api/documents/:id/history
 * @access Private (document:read | document:manage)
 * @param c - Hono context
 */
export const getDocumentHistory = async (c: Context<AppBindings>) => {
  const { tenantId } = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const history = await getDocumentStatusHistory(id, tenantId);
  return sendSuccess(c, history, { results: history.length });
};
