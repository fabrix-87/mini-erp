import {
  validateCreateCustomer,
  validateUpdateCustomer,
  validateUpdateCustomerCompany,
  validateCustomerId,
  validateCustomerQuery,
} from '../validators/customer-validator';

import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateCustomerCompany,
  getCustomerStats,
  deleteCustomer,
  validateCustomerFiscal,
  getCustomerListStats,
} from '../controllers/customer-controller';
import { createHonoApp } from '@/lib/hono-app';
import { authenticateToken, authorize } from '@/middleware/auth-middleware';

const customerRoutes = createHonoApp()

// ============================================================================
// CUSTOMER ROUTES
// ============================================================================

/**
 * @route   GET /api/customers
 * @desc    Lista tutti i customers con filtri CRM
 * @access  Private (customer:read)
 * @query   page, limit, search, type, priority, segment, leadStatus, creditStatus, size
 */
customerRoutes.get(
  '/',
  authenticateToken,
  authorize(['customer:read', 'customer:manage']),
  validateCustomerQuery,
  getAllCustomers
);

/**
 * @route   GET /api/customers/stats
 * @desc    Statistiche generali customer
 * @access  Private (customer:read)
 * @query   page, limit, search, type, priority, segment, leadStatus, creditStatus, size
 */
customerRoutes.get(
  '/stats',
  authenticateToken,
  authorize(['customer:read', 'customer:manage']),
  validateCustomerQuery,
  getCustomerListStats
);

/**
 * @route   GET /api/customers/:id/stats
 * @desc    Ottieni statistiche avanzate customer
 * @access  Private (customer:read)
 */
customerRoutes.get(
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
customerRoutes.post(
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
customerRoutes.put(
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
customerRoutes.put(
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
customerRoutes.delete(
  '/:id',
  authenticateToken,
  authorize(['customer:delete', 'customer:manage']),
  validateCustomerId,
  deleteCustomer
);

/**
 * @desc    Valida i dati fiscali della company del customer
 * @route   POST /api/customers/:id/validate-fiscal
 * @access  Private (customer:read)
 */
customerRoutes.get(
  '/:id/validate-fiscal',
  authenticateToken,
  authorize(['customer:read', 'customer:manage']),
  validateCustomerId,
  validateCustomerFiscal
);

/**
 * @route   GET /api/customers/:id
 * @desc    Ottieni dettagli customer con statistiche
 * @access  Private (customer:read)
 */
customerRoutes.get(
  '/:id',
  authenticateToken,
  authorize(['customer:read', 'customer:manage']),
  validateCustomerId,
  getCustomerById
);



// ============================================================================
// EXPORT
// ============================================================================

export default customerRoutes;