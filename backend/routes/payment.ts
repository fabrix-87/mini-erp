import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  CreatePaymentMethodSchema,
  UpdatePaymentMethodSchema,
  UpdatePaymentTermDetailsSchema,
  CalculateDueDatesSchema,
  PaymentMethodIdSchema,
  PaymentQuerySchema,
  TogglePaymentStatusSchema,
} from '../validators/payment';
import {
  getAllPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  updatePaymentTermDetails,
  togglePaymentMethodActive,
  deletePaymentMethod,
  calculateDueDates,
} from '../controllers/payment';

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
  '/',
  authenticateToken,
  authorize(['payment:read', 'payment:manage']),
  validate(PaymentQuerySchema, 'Payment query', { source: ['query'] }),
  getAllPaymentMethods
);

/**
 * @route   GET /api/payment-methods/:id
 * @desc    Ottieni dettagli di un Payment Method specifico
 * @access  Private (payment:read)
 */
router.get(
  '/:id',
  authenticateToken,
  authorize(['payment:read', 'payment:manage']),
  validate(PaymentMethodIdSchema, 'Payment Method ID', { source: ['params'] }),
  getPaymentMethodById
);

/**
 * @route   POST /api/payment-methods
 * @desc    Crea nuovo Payment Method
 * @access  Private (payment:create)
 */
router.post(
  '/',
  authenticateToken,
  authorize(['payment:create', 'payment:manage']),
  validate(CreatePaymentMethodSchema, 'Payment method creation'),
  createPaymentMethod
);

/**
 * @route   PUT /api/payment-methods/:id
 * @desc    Aggiorna Payment Method esistente
 * @access  Private (payment:update)
 */
router.put(
  '/:id',
  authenticateToken,
  authorize(['payment:update', 'payment:manage']),
  validate(PaymentMethodIdSchema, 'Payment Method ID', { source: ['params'] }),
  validate(UpdatePaymentMethodSchema, 'Payment method update'),
  updatePaymentMethod
);

/**
 * @route   PUT /api/payment-methods/:id/details
 * @desc    Aggiorna Payment Term Details (rate di pagamento)
 * @access  Private (payment:update)
 */
router.put(
  '/:id/details',
  authenticateToken,
  authorize(['payment:update', 'payment:manage']),
  validate(PaymentMethodIdSchema, 'Payment Method ID', { source: ['params'] }),
  validate(UpdatePaymentTermDetailsSchema, 'Payment term details'),
  updatePaymentTermDetails
);

/**
 * @route   PATCH /api/payment-methods/:id/toggle-active
 * @desc    Attiva/Disattiva un Payment Method
 * @access  Private (payment:update)
 */
router.patch(
  '/:id/toggle-active',
  authenticateToken,
  authorize(['payment:update', 'payment:manage']),
  validate(PaymentMethodIdSchema, 'Payment Method ID', { source: ['params'] }),
  validate(TogglePaymentStatusSchema, 'Toggle status'),
  togglePaymentMethodActive
);

/**
 * @route   POST /api/payment-methods/:id/calculate-due-dates
 * @desc    Calcola date di scadenza per un importo
 * @access  Private (payment:read)
 * @body    invoiceDate, totalAmount
 */
router.post(
  '/:id/calculate-due-dates',
  authenticateToken,
  authorize(['payment:read', 'payment:manage']),
  validate(PaymentMethodIdSchema, 'Payment Method ID', { source: ['params'] }),
  validate(CalculateDueDatesSchema, 'Calculate due dates'),
  calculateDueDates
);

/**
 * @route   DELETE /api/payment-methods/:id
 * @desc    Elimina un Payment Method
 * @access  Private (payment:delete)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorize(['payment:delete', 'payment:manage']),
  validate(PaymentMethodIdSchema, 'Payment Method ID', { source: ['params'] }),
  deletePaymentMethod
);

// ============================================================================
// EXPORT
// ============================================================================

export default router;