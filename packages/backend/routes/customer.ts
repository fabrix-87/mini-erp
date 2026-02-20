import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import {
  validateCreateCustomer,
  validateUpdateCustomer,
  validateUpdateCustomerCompany,
  validateCustomerId,
  validateCustomerQuery,
} from '../validators/customer';

import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateCustomerCompany,
  getCustomerStats,
  deleteCustomer,
} from '../controllers/customer';

const router = express.Router();

// ============================================================================
// CUSTOMER ROUTES
// ============================================================================

/**
 * @route   GET /api/customers
 * @desc    Lista tutti i customers con filtri CRM
 * @access  Private (customer:read)
 * @query   page, limit, search, type, priority, segment, leadStatus, creditStatus, size
 */
router.get(
  '/',
  authenticateToken,
  authorize(['customer:read', 'customer:manage']),
  validateCustomerQuery,
  getAllCustomers
);

/**
 * @route   GET /api/customers/:id/stats
 * @desc    Ottieni statistiche avanzate customer
 * @access  Private (customer:read)
 */
router.get(
  '/:id/stats',
  authenticateToken,
  authorize(['customer:read', 'customer:manage']),
  validateCustomerId,
  getCustomerStats
);

/**
 * @route   POST /api/customers
 * @desc    Crea nuovo customer (con company nested)
 * @access  Private (customer:create)
 */
router.post(
  '/',
  authenticateToken,
  authorize(['customer:create', 'customer:manage']),
  validateCreateCustomer,
  createCustomer
);

/**
 * @route   PUT /api/customers/:id/company
 * @desc    Aggiorna dati anagrafici company del customer
 * @access  Private (customer:update)
*/
router.put(
  '/:id/company',
  authenticateToken,
  authorize(['customer:update', 'customer:manage']),
  validateCustomerId,
  validateUpdateCustomerCompany,
  updateCustomerCompany
);

/**
 * @route   PUT /api/customers/:id
 * @desc    Aggiorna dati CRM customer
 * @access  Private (customer:update)
 */
router.put(
  '/:id',
  authenticateToken,
  authorize(['customer:update', 'customer:manage']),
  validateCustomerId,
  validateUpdateCustomer,
  updateCustomer
);

/**
 * @route   DELETE /api/customers/:id
 * @desc    Elimina customer (se non ha relazioni)
 * @access  Private (customer:delete)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorize(['customer:delete', 'customer:manage']),
  validateCustomerId,
  deleteCustomer
);

/**
 * @route   GET /api/customers/:id
 * @desc    Ottieni dettagli customer con statistiche
 * @access  Private (customer:read)
 */
router.get(
  '/:id',
  authenticateToken,
  authorize(['customer:read', 'customer:manage']),
  validateCustomerId,
  getCustomerById
);


// ============================================================================
// EXPORT
// ============================================================================

export default router;