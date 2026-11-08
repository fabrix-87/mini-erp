// document-installments-controller.ts
import type { Context } from "hono";
import type { AppBindings } from "@/lib/hono-app";
import type {
  DocumentIdParam,
  GenerateInstallmentsInput,
  InstallmentIdParam,
  PayInstallmentInput,
  ReplaceInstallmentsInput,
} from "@mini-erp/shared";
import { getValidatedBody, getValidatedParams } from "@/helpers/validated-context";
import { requireDocumentContext } from "@/helpers/document/document-context";
import { sendSuccess } from "@/utils/response-utils";
import {
  generateDocumentInstallments,
  listDocumentInstallments,
  registerInstallmentPayment,
  replaceDocumentInstallments,
} from "@/services/document";

/**
 * Lists the installments of a document.
 * @route GET /api/documents/:id/installments
 * @access Private (document:read | document:manage)
 */
export const getDocumentInstallments = async (c: Context<AppBindings>) => {
  const { tenantId } = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const installments = await listDocumentInstallments(id, tenantId);
  return sendSuccess(c, installments, { results: installments.length });
};

/**
 * Generates the installment plan of a draft from a payment method.
 * @route POST /api/documents/:id/installments/generate
 * @access Private (document:update | document:manage)
 */
export const generateInstallmentPlan = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const input = getValidatedBody<GenerateInstallmentsInput>(c);
  const installments = await generateDocumentInstallments({ documentId: id, input, context });
  return sendSuccess(c, installments, {
    message: "Piano rate generato",
    results: installments.length,
  });
};

/**
 * Replaces the whole installment plan of a draft.
 * @route PUT /api/documents/:id/installments
 * @access Private (document:update | document:manage)
 */
export const replaceInstallments = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const input = getValidatedBody<ReplaceInstallmentsInput>(c);
  const installments = await replaceDocumentInstallments({ documentId: id, input, context });
  return sendSuccess(c, installments, {
    message: "Piano rate aggiornato",
    results: installments.length,
  });
};

/**
 * Registers a payment on an installment.
 * @route POST /api/documents/:id/installments/:installmentId/pay
 * @access Private (document:pay | document:manage)
 */
export const payInstallment = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id, installmentId } = getValidatedParams<InstallmentIdParam>(c);
  const input = getValidatedBody<PayInstallmentInput>(c);
  const installment = await registerInstallmentPayment({
    documentId: id,
    installmentId,
    input,
    context,
  });
  return sendSuccess(c, installment, { message: "Pagamento registrato" });
};
