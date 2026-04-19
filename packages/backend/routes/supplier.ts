import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import {
  validateCreateSupplier,
  validateUpdateSupplier,
  validateUpdateSupplierCompany,
  validateUpdateSupplierRating,
  validateSupplierId,
  validateSupplierQuery,
} from '../validators/supplier';

import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  updateSupplierCompany,
  updateSupplierRating,
  getSupplierStats,
  deleteSupplier,
  validateSupplierFiscal,
} from '../controllers/supplier';

const router = express.Router();

// ============================================================================
// SUPPLIER ROUTES
// ============================================================================

/**
 * @route   GET /api/suppliers
 * @desc    Lista tutti i suppliers con filtri
 * @access  Private (supplier:read)
 * @query   page, limit, search, minRating, hasProducts, status, countryCode
 */
router.get(
  '/',
  authenticateToken,
  authorize(['supplier:read', 'supplier:manage']),
  validateSupplierQuery,
  getAllSuppliers
);

/**
 * @route   GET /api/suppliers/:id/stats
 * @desc    Ottieni statistiche avanzate supplier
 * @access  Private (supplier:read)
 */
router.get(
  '/:id/stats',
  authenticateToken,
  authorize(['supplier:read', 'supplier:manage']),
  validateSupplierId,
  getSupplierStats
);

/**
 * @route   POST /api/suppliers
 * @desc    Crea nuovo supplier (con company nested)
 * @access  Private (supplier:create)
 */
router.post(
  '/',
  authenticateToken,
  authorize(['supplier:create', 'supplier:manage']),
  validateCreateSupplier,
  createSupplier
);

/**
 * @route   PUT /api/suppliers/:id/company
 * @desc    Aggiorna dati anagrafici company del supplier
 * @access  Private (supplier:update)
*/
router.put(
  '/:id/company',
  authenticateToken,
  authorize(['supplier:update', 'supplier:manage']),
  validateSupplierId,
  validateUpdateSupplierCompany,
  updateSupplierCompany
);

/**
 * @route   PUT /api/suppliers/:id
 * @desc    Aggiorna dati supplier
 * @access  Private (supplier:update)
 */
router.put(
  '/:id',
  authenticateToken,
  authorize(['supplier:update', 'supplier:manage']),
  validateSupplierId,
  validateUpdateSupplier,
  updateSupplier
);

/**
 * @route   PATCH /api/suppliers/:id/rating
 * @desc    Aggiorna rating supplier con note
 * @access  Private (supplier:update)
 */
router.patch(
  '/:id/rating',
  authenticateToken,
  authorize(['supplier:update', 'supplier:manage']),
  validateSupplierId,
  validateUpdateSupplierRating,
  updateSupplierRating
);

/**
 * @route   DELETE /api/suppliers/:id
 * @desc    Elimina supplier (se non ha relazioni)
 * @access  Private (supplier:delete)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorize(['supplier:delete', 'supplier:manage']),
  validateSupplierId,
  deleteSupplier
);

/**
 * @desc    Valida i dati fiscali della company del supplier
 * @route   POST /api/suppliers/:id/validate-fiscal
 * @access  Private (supplier:read)
 */
router.post(
  '/:id/validate-fiscal',
  authenticateToken,
  authorize(['supplier:read', 'supplier:manage']),
  validateSupplierId,
  validateSupplierFiscal
);

/**
 * @route   GET /api/suppliers/:id
 * @desc    Ottieni dettagli supplier con statistiche
 * @access  Private (supplier:read)
 */
router.get(
  '/:id',
  authenticateToken,
  authorize(['supplier:read', 'supplier:manage']),
  validateSupplierId,
  getSupplierById
);
// ============================================================================
// EXPORT
// ============================================================================

export default router;