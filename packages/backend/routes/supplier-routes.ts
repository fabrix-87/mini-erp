
import { authorize } from '../middleware/auth-middleware';
import {
  validateCreateSupplier,
  validateUpdateSupplier,
  validateUpdateSupplierCompany,
  validateUpdateSupplierRating,
  validateSupplierId,
  validateSupplierQuery,
} from '../validators/supplier-validator';

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
  getSupplierListStats,
} from '../controllers/supplier-controller';
import { createHonoApp } from '@/lib/hono-app';
import { requireTenantScope } from '@/middleware/tenant-scope-middleware';

const supplierRoutes = createHonoApp();

// ============================================================================
// SUPPLIER ROUTES
// ============================================================================

/**
 * @route   GET /api/suppliers
 * @desc    Lista tutti i suppliers con filtri
 * @access  Private (supplier:read)
 * @query   page, limit, search, minRating, hasProducts, status, countryCode
 */
supplierRoutes.get(
  '/',
  requireTenantScope,
  authorize(['supplier:read', 'supplier:manage']),
  validateSupplierQuery,
  getAllSuppliers
);

/**
 * @route   GET /api/suppliers/stats
 * @desc    Statistiche generali supplier
 * @access  Private (supplier:read)
 * @query   page, limit, search, minRating, hasProducts, status, countryCode
 */
supplierRoutes.get(
  '/stats',
  requireTenantScope,
  authorize(['supplier:read', 'supplier:manage']),
  validateSupplierQuery,
  getSupplierListStats
);

/**
 * @route   GET /api/suppliers/:id/stats
 * @desc    Ottieni statistiche avanzate supplier
 * @access  Private (supplier:read)
 */
supplierRoutes.get(
  '/:id/stats',
  requireTenantScope,
  authorize(['supplier:read', 'supplier:manage']),
  validateSupplierId,
  getSupplierStats
);

/**
 * @route   POST /api/suppliers
 * @desc    Crea nuovo supplier (con company nested)
 * @access  Private (supplier:create)
 */
supplierRoutes.post(
  '/',
  requireTenantScope,
  authorize(['supplier:create', 'supplier:manage']),
  validateCreateSupplier,
  createSupplier
);

/**
 * @route   PUT /api/suppliers/:id/company
 * @desc    Aggiorna dati anagrafici company del supplier
 * @access  Private (supplier:update)
*/
supplierRoutes.put(
  '/:id/company',
  requireTenantScope,
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
supplierRoutes.put(
  '/:id',
  requireTenantScope,
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
supplierRoutes.patch(
  '/:id/rating',
  requireTenantScope,
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
supplierRoutes.delete(
  '/:id',
  requireTenantScope,
  authorize(['supplier:delete', 'supplier:manage']),
  validateSupplierId,
  deleteSupplier
);

/**
 * @desc    Valida i dati fiscali della company del supplier
 * @route   POST /api/suppliers/:id/validate-fiscal
 * @access  Private (supplier:read)
 */
supplierRoutes.post(
  '/:id/validate-fiscal',
  requireTenantScope,
  authorize(['supplier:read', 'supplier:manage']),
  validateSupplierId,
  validateSupplierFiscal
);

/**
 * @route   GET /api/suppliers/:id
 * @desc    Ottieni dettagli supplier con statistiche
 * @access  Private (supplier:read)
 */
supplierRoutes.get(
  '/:id',
  requireTenantScope,
  authorize(['supplier:read', 'supplier:manage']),
  validateSupplierId,
  getSupplierById
);
// ============================================================================
// EXPORT
// ============================================================================

export default supplierRoutes;