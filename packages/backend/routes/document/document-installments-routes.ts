/**
 * @module document-installments-routes
 * @description Routes for the installment plan of payable documents:
 * list, generate from the payment method, replace the plan, register a payment.
 */
import { createHonoApp } from "../../lib/hono-app";
import { authorize } from "../../middleware/auth-middleware";
import {
  validateDocumentId,
  validateDocumentInstallmentIdParam,
  validateGenerateDocumentInstallments,
  validatePayDocumentInstallment,
  validateReplaceDocumentInstallments,
} from "../../validators/document-validator";
import {
  getDocumentInstallments,
  payInstallment,
  generateInstallmentPlan,
  replaceInstallments,
} from "../../controllers/document";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const installmentRoutes = createHonoApp();

const canUpdate = authorize(["document:update", "document:manage"]);
const canPay = authorize(["document:pay", "document:manage"]);

/**
 * @route GET /api/documents/:id/installments
 * @desc  List all payment installments for a document
 * @access Private (document:read | document:manage)
 */
installmentRoutes.get(
  "/:id/installments",
  authorize(["document:read", "document:manage"]),
  requireTenantScope,
  validateDocumentId,
  getDocumentInstallments,
);

/**
 * @route POST /api/documents/:id/installments/generate
 * @desc  Auto-generate a payment plan based on terms and total amount
 * @access Private (document:update | document:manage)
 */
installmentRoutes.post(
  "/:id/installments/generate",
  canUpdate,
  requireTenantScope,
  validateDocumentId,
  validateGenerateDocumentInstallments,
  generateInstallmentPlan,
);

/**
 * @route POST /api/documents/:id/installments/:installmentId/pay
 * @desc  Register a payment against an installment
 * @access Private (document:pay | document:manage)
 */
installmentRoutes.post(
  "/:id/installments/:installmentId/pay",
  canPay,
  requireTenantScope,
  validateDocumentId,
  validateDocumentInstallmentIdParam,
  validatePayDocumentInstallment,
  payInstallment,
);

/**
 * @route PUT /api/documents/:id/installments
 * @desc Replace all installments with a new set of installments
 * @access Private (document:update | document:manage)
 */
installmentRoutes.put(
  "/:id/installments",
  canUpdate,
  requireTenantScope,
  validateDocumentId,
  validateReplaceDocumentInstallments,
  replaceInstallments,
);

export default installmentRoutes;
