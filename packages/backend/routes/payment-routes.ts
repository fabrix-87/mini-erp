import { authenticateToken, authorize } from "../middleware/auth-middleware";

import {
  getAllPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  updatePaymentTermDetails,
  togglePaymentMethodActive,
  deletePaymentMethod,
  calculateDueDates,
} from "../controllers/payment-controller";
import {
  validatePaymentQuery,
  validatePaymentMethodIdParam,
  validateCreatePaymentMethod,
  validateUpdatePaymentMethod,
  validateUpdatePaymentTermDetails,
  validateTogglePaymentMethod,
  validateCalcolateDueDates,
} from "@/validators/payment-validator";
import { createHonoApp } from "@/lib/hono-app";

const paymentRoutes = createHonoApp();

// ============================================================================
// PAYMENT METHOD ROUTES
// ============================================================================

/**
 * @route   GET /api/payment-methods
 * @desc    Ottieni tutti i Payment Methods
 * @access  Private (payment:read)
 * @query   active, sortBy, sortOrder
 */
paymentRoutes.get(
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
paymentRoutes.get(
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
paymentRoutes.post(
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
paymentRoutes.put(
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
paymentRoutes.put(
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
paymentRoutes.patch(
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
paymentRoutes.post(
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
paymentRoutes.delete(
  "/:id",
  authenticateToken,
  authorize(["payment:delete", "payment:manage"]),
  validatePaymentMethodIdParam,
  deletePaymentMethod,
);

// ============================================================================
// EXPORT
// ============================================================================

export default paymentRoutes;
