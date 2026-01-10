// routes/dashboard.ts

import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import {
  validateDashboardOverview,
  validateDashboardSales,
  validateDashboardOpportunity,
  validateDashboardProduct,
  validateDashboardCustomer,
  validateDashboardDocument,
  validateDashboardFinancial,
  validateDashboardWarehouse,
  validateDashboardQuery,
} from '../validators/dashboard';
import {
  getDashboardOverview,
  getSalesStatistics,
  getOpportunityStatistics,
  getProductStatistics,
  getCustomerStatistics,
  getDocumentStatistics,
  getFinancialStatistics,
  getWarehouseStatistics,
  getSupplierStatistics,
} from '../controllers/dashboard';

const router = express.Router();

// ============================================================================
// DASHBOARD ROUTES
// ============================================================================

/**
 * @route   GET /api/dashboard/overview
 * @desc    KPI principali aggregati
 * @access  Private (dashboard:read)
 */
router.get(
  '/overview',
  authenticateToken,
  authorize(['dashboard:read', 'dashboard:manage']),
  validateDashboardOverview,
  getDashboardOverview
);

/**
 * @route   GET /api/dashboard/sales
 * @desc    Statistiche vendite con trend e top performers
 * @access  Private (dashboard:read)
 */
router.get(
  '/sales',
  authenticateToken,
  authorize(['dashboard:read', 'dashboard:manage']),
  validateDashboardSales,
  getSalesStatistics
);

/**
 * @route   GET /api/dashboard/opportunities
 * @desc    Pipeline CRM e metriche opportunità
 * @access  Private (dashboard:read)
 */
router.get(
  '/opportunities',
  authenticateToken,
  authorize(['dashboard:read', 'dashboard:manage']),
  validateDashboardOpportunity,
  getOpportunityStatistics
);

/**
 * @route   GET /api/dashboard/products
 * @desc    Performance prodotti e alert scorte
 * @access  Private (dashboard:read)
 */
router.get(
  '/products',
  authenticateToken,
  authorize(['dashboard:read', 'dashboard:manage']),
  validateDashboardProduct,
  getProductStatistics
);

/**
 * @route   GET /api/dashboard/customers
 * @desc    Segmentazione clienti e LTV
 * @access  Private (dashboard:read)
 */
router.get(
  '/customers',
  authenticateToken,
  authorize(['dashboard:read', 'dashboard:manage']),
  validateDashboardCustomer,
  getCustomerStatistics
);

/**
 * @route   GET /api/dashboard/documents
 * @desc    Workflow documenti e pagamenti
 * @access  Private (dashboard:read)
 */
router.get(
  '/documents',
  authenticateToken,
  authorize(['dashboard:read', 'dashboard:manage']),
  validateDashboardDocument,
  getDocumentStatistics
);

/**
 * @route   GET /api/dashboard/financial
 * @desc    Contabilità, P&L, cash flow
 * @access  Private (dashboard:read, financial:read)
 */
router.get(
  '/financial',
  authenticateToken,
  authorize(['dashboard:read', 'dashboard:manage', 'financial:read']),
  validateDashboardFinancial,
  getFinancialStatistics
);

/**
 * @route   GET /api/dashboard/warehouse
 * @desc    Statistiche magazzino e movimenti
 * @access  Private (dashboard:read, warehouse:read)
 */
router.get(
  '/warehouse',
  authenticateToken,
  authorize(['dashboard:read', 'dashboard:manage', 'warehouse:read']),
  validateDashboardWarehouse,
  getWarehouseStatistics
);

/**
 * @route   GET /api/dashboard/warehouse
 * @desc    Statistiche magazzino e movimenti
 * @access  Private (dashboard:read, warehouse:read)
 */
router.get(
  '/supplier',
  authenticateToken,
  authorize(['dashboard:read', 'dashboard:manage', 'supplier:read']),
  validateDashboardQuery,
  getSupplierStatistics
);

// ============================================================================
// EXPORT
// ============================================================================

export default router;