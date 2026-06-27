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
  validateCreateDocumentInstallments,
  validateUpdateDocumentInstallments,
} from "../../validators/document-validator";
import {
  getDocumentInstallments,
  getInstallmentById,
  createInstallment,
  updateInstallment,
  deleteInstallment,
  payInstallment,
  generateInstallmentPlan,
} from "../../controllers/document";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const installmentRoutes = createHonoApp();

/**
 * @route GET /api/documents/:id/installments
 * @desc  List all payment installments for a document
 * @access Private (document:read)
 */
installmentRoutes.get(
  "/:id/installments",
  requireTenantScope,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  getDocumentInstallments,
);

/**
 * @route POST /api/documents/:id/installments/generate-plan
 * @desc  Auto-generate a payment plan based on terms and total amount
 * @access Private (document:update)
 */
installmentRoutes.post(
  "/:id/installments/generate-plan",
  requireTenantScope,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  generateInstallmentPlan,
);

/**
 * @route POST /api/documents/:id/installments
 * @desc  Add a single installment to a document
 * @access Private (document:update)
 */
installmentRoutes.post(
  "/:id/installments",
  requireTenantScope,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateCreateDocumentInstallments,
  createInstallment,
);

/**
 * @route GET /api/documents/:id/installments/:installmentId
 * @desc  Get a single installment by ID
 * @access Private (document:read)
 */
installmentRoutes.get(
  "/:id/installments/:installmentId",
  requireTenantScope,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  validateDocumentInstallmentIdParam,
  getInstallmentById,
);

/**
 * @route PUT /api/documents/:id/installments/:installmentId
 * @desc  Update an installment (amount, dueDate, notes)
 * @access Private (document:update)
 */
installmentRoutes.put(
  "/:id/installments/:installmentId",
  requireTenantScope,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateDocumentInstallmentIdParam,
  validateUpdateDocumentInstallments,
  updateInstallment,
);

/**
 * @route POST /api/documents/:id/installments/:installmentId/pay
 * @desc  Register a payment against an installment
 * @access Private (document:update)
 */
installmentRoutes.post(
  "/:id/installments/:installmentId/pay",
  requireTenantScope,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateDocumentInstallmentIdParam,
  payInstallment,
);

/**
 * @route DELETE /api/documents/:id/installments/:installmentId
 * @desc  Delete an installment from a document
 * @access Private (document:update)
 */
installmentRoutes.delete(
  "/:id/installments/:installmentId",
  requireTenantScope,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateDocumentInstallmentIdParam,
  deleteInstallment,
);

export default installmentRoutes;
