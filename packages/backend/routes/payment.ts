import express from "express";
import { authenticateToken, authorize } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  CreatePaymentMethodSchema,
  UpdatePaymentMethodSchema,
  UpdatePaymentTermDetailsSchema,
  CalculateDueDatesSchema,
  PaymentMethodIdSchema,
  TogglePaymentStatusSchema,
} from "@mini-erp/shared/validators";
import {
  getAllPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  updatePaymentTermDetails,
  togglePaymentMethodActive,
  deletePaymentMethod,
  calculateDueDates,
} from "../controllers/payment";
import {
  validatePaymentQuery,
  validatePaymentMethodIdParam,
  validateCreatePaymentMethod,
  validateUpdatePaymentMethod,
  validateUpdatePaymentTermDetails,
  validateTogglePaymentMethod,
  validateCalcolateDueDates,
} from "@/validators/payment";

const router = express.Router();

// ============================================================================
// PAYMENT METHOD ROUTES
// ============================================================================

/**
 * @route   GET /api/payment-methods
 * @desc    Ottieni tutti i Payment Methods
 * @access  Private (payment:read)
 * @query   active, sortBy, sortOrder
 */
router.get(
  "/",
  authenticateToken,
  authorize(["payment:read", "payment:manage"]),
  validatePaymentQuery,
  getAllPaymentMethods,
);

/**
 * @route   GET /api/payment-methods/:id
 * @desc    Ottieni dettagli di un Payment Method specifico
 * @access  Private (payment:read)
 */
router.get(
  "/:id",
  authenticateToken,
  authorize(["payment:read", "payment:manage"]),
  validatePaymentMethodIdParam,
  getPaymentMethodById,
);

/**
 * @route   POST /api/payment-methods
 * @desc    Crea nuovo Payment Method
 * @access  Private (payment:create)
 */
router.post(
  "/",
  authenticateToken,
  authorize(["payment:create", "payment:manage"]),
  validateCreatePaymentMethod,
  createPaymentMethod,
);

/**
 * @route   PUT /api/payment-methods/:id
 * @desc    Aggiorna Payment Method esistente
 * @access  Private (payment:update)
 */
router.put(
  "/:id",
  authenticateToken,
  authorize(["payment:update", "payment:manage"]),
  validatePaymentMethodIdParam,
  validateUpdatePaymentMethod,
  updatePaymentMethod,
);

/**
 * @route   PUT /api/payment-methods/:id/details
 * @desc    Aggiorna Payment Term Details (rate di pagamento)
 * @access  Private (payment:update)
 */
router.put(
  "/:id/details",
  authenticateToken,
  authorize(["payment:update", "payment:manage"]),
  validatePaymentMethodIdParam,
  validateUpdatePaymentTermDetails,
  updatePaymentTermDetails,
);

/**
 * @route   PATCH /api/payment-methods/:id/toggle-active
 * @desc    Attiva/Disattiva un Payment Method
 * @access  Private (payment:update)
 */
router.patch(
  "/:id/toggle-active",
  authenticateToken,
  authorize(["payment:update", "payment:manage"]),
  validatePaymentMethodIdParam,
  validateTogglePaymentMethod,
  togglePaymentMethodActive,
);

/**
 * @route   POST /api/payment-methods/:id/calculate-due-dates
 * @desc    Calcola date di scadenza per un importo
 * @access  Private (payment:read)
 * @body    invoiceDate, totalAmount
 */
router.post(
  "/:id/calculate-due-dates",
  authenticateToken,
  authorize(["payment:read", "payment:manage"]),
  validatePaymentMethodIdParam,
  validateCalcolateDueDates,
  calculateDueDates,
);

/**
 * @route   DELETE /api/payment-methods/:id
 * @desc    Elimina un Payment Method
 * @access  Private (payment:delete)
 */
router.delete(
  "/:id",
  authenticateToken,
  authorize(["payment:delete", "payment:manage"]),
  validatePaymentMethodIdParam,
  deletePaymentMethod,
);

// ============================================================================
// EXPORT
// ============================================================================

export default router;
