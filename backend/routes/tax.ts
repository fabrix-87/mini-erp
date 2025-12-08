import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import {
  validateCreateTaxRate,
  validateUpdateTaxRate,
  validateCreateTaxRule,
  validateUpdateTaxRule,
  validateTaxRateId,
  validateTaxRuleId,
  validateTaxRuleQuery,
  validateToggleTaxRuleStatus,
  validateTaxRateQuery,
  validateToggleTaxRateStatus,
} from '../validators/tax';
import {
  getAllTaxRates,
  getTaxRateById,
  createTaxRate,
  updateTaxRate,
  toggleTaxRateActive,
  deleteTaxRate,
  getAllTaxRules,
  getTaxRuleById,
  createTaxRule,
  updateTaxRule,
  toggleTaxRuleActive,
  deleteTaxRule,
} from '../controllers/tax';

const router = express.Router();

// ============================================================================
// TAX RATE ROUTES
// ============================================================================

/**
 * @route   GET /api/tax/rates
 * @desc    Ottieni tutte le Tax Rates
 * @access  Private (tax:read)
 * @query   active, sortBy, sortOrder
 */
router.get(
  '/rates',
  authenticateToken,
  authorize(['tax:read', 'tax:manage']),
  validateTaxRateQuery,
  getAllTaxRates
);

/**
 * @route   GET /api/tax/rates/:id
 * @desc    Ottieni dettagli di una Tax Rate specifica
 * @access  Private (tax:read)
 */
router.get(
  '/rates/:id',
  authenticateToken,
  authorize(['tax:read', 'tax:manage']),
  validateTaxRateId,
  getTaxRateById
);

/**
 * @route   POST /api/tax/rates
 * @desc    Crea nuova Tax Rate
 * @access  Private (tax:create)
 */
router.post(
  '/rates',
  authenticateToken,
  authorize(['tax:create', 'tax:manage']),
  validateCreateTaxRate,
  createTaxRate
);

/**
 * @route   PUT /api/tax/rates/:id
 * @desc    Aggiorna Tax Rate esistente
 * @access  Private (tax:update)
 */
router.put(
  '/rates/:id',
  authenticateToken,
  authorize(['tax:update', 'tax:manage']),
  validateTaxRateId,
  validateUpdateTaxRate,
  updateTaxRate
);

/**
 * @route   PATCH /api/tax/rates/:id/toggle-active
 * @desc    Attiva/Disattiva una Tax Rate
 * @access  Private (tax:update)
 */
router.patch(
  '/rates/:id/toggle-active',
  authenticateToken,
  authorize(['tax:update', 'tax:manage']),
  validateToggleTaxRateStatus,
  toggleTaxRateActive
);

/**
 * @route   DELETE /api/tax/rates/:id
 * @desc    Elimina una Tax Rate
 * @access  Private (tax:delete)
 */
router.delete(
  '/rates/:id',
  authenticateToken,
  authorize(['tax:delete', 'tax:manage']),
  validateTaxRateId,
  deleteTaxRate
);

// ============================================================================
// TAX RULE ROUTES
// ============================================================================

/**
 * @route   GET /api/tax/rules
 * @desc    Ottieni tutte le Tax Rules
 * @access  Private (tax:read)
 * @query   active, operationType, sortBy, sortOrder
 */
router.get(
  '/rules',
  authenticateToken,
  authorize(['tax:read', 'tax:manage']),
  validateTaxRuleQuery,
  getAllTaxRules
);

/**
 * @route   GET /api/tax/rules/:id
 * @desc    Ottieni dettagli di una Tax Rule specifica
 * @access  Private (tax:read)
 */
router.get(
  '/rules/:id',
  authenticateToken,
  authorize(['tax:read', 'tax:manage']),
  validateTaxRuleId,
  getTaxRuleById
);

/**
 * @route   POST /api/tax/rules
 * @desc    Crea nuova Tax Rule
 * @access  Private (tax:create)
 */
router.post(
  '/rules',
  authenticateToken,
  authorize(['tax:create', 'tax:manage']),
  validateCreateTaxRule,
  createTaxRule
);

/**
 * @route   PUT /api/tax/rules/:id
 * @desc    Aggiorna Tax Rule esistente
 * @access  Private (tax:update)
 */
router.put(
  '/rules/:id',
  authenticateToken,
  authorize(['tax:update', 'tax:manage']),
  validateUpdateTaxRule,
  updateTaxRule
);

/**
 * @route   PATCH /api/tax/rules/:id/toggle-active
 * @desc    Attiva/Disattiva una Tax Rule
 * @access  Private (tax:update)
 */
router.patch(
  '/rules/:id/toggle-active',
  authenticateToken,
  authorize(['tax:update', 'tax:manage']),
  validateToggleTaxRuleStatus,
  toggleTaxRuleActive
);

/**
 * @route   DELETE /api/tax/rules/:id
 * @desc    Elimina una Tax Rule
 * @access  Private (tax:delete)
 */
router.delete(
  '/rules/:id',
  authenticateToken,
  authorize(['tax:delete', 'tax:manage']),
  validateTaxRuleId,
  deleteTaxRule
);

// ============================================================================
// EXPORT
// ============================================================================

export default router;