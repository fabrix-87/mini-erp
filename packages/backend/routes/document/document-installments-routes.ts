/**
 * @module document-installments-routes
 * @description Routes for payment installment management on documents.
 * Covers full CRUD, payment registration, and automatic plan generation.
 * Static sub-paths (/generate-plan) are registered before /:installmentId.
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
 * @access Private (document:read)
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
 * @access Private (document:update)
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
 * @access Private (document:pay)
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
 * @descr Replace all installments with a new set of installments
 * @access Private (document:update)
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
