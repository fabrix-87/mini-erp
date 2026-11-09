/**
 * @module document-reports-routes
 * @description Routes for document reporting and analytics.
 * Mounted at /reports in the document index router.
 */
import { createHonoApp } from "../../lib/hono-app";
import { authorize } from "../../middleware/auth-middleware";
import {
  validateAgingReportQuery,
  validateDocumentStatsQuery,
  validateOverdueInstallmentsQuery,
  validateSalesReportQuery,
  validateTopProductsReportQuery,
} from "../../validators/document-validator";
import {
  getDocumentStats,
  getSalesReport,
  getAgingReport,
  getTopProducts,
  getOverdueInstallments,
} from "../../controllers/document";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const reportsRoutes = createHonoApp();

/**
 * @route GET /api/documents/reports/statistics
 * @desc  Aggregate document statistics (counts by type and status)
 * @access Private (report:read)
 */
reportsRoutes.get(
  "/statistics",
  requireTenantScope,
  authorize(["report:read", "document:manage"]),
  validateDocumentStatsQuery,
  getDocumentStats,
);

/**
 * @route GET /api/documents/reports/sales
 * @desc  Sales report grouped by day, month or year
 * @access Private (report:read)
 */
reportsRoutes.get(
  "/sales",
  requireTenantScope,
  authorize(["report:read", "document:manage"]),
  validateSalesReportQuery,
  getSalesReport,
);

/**
 * @route GET /api/documents/reports/aging
 * @desc  Receivables aging report (overdue buckets)
 * @access Private (report:read)
 */
reportsRoutes.get(
  "/aging",
  requireTenantScope,
  authorize(["report:read", "document:manage"]),
  validateAgingReportQuery,
  getAgingReport,
);

/**
 * @route GET /api/documents/reports/top-products
 * @desc  Top-selling products by quantity or revenue
 * @access Private (report:read)
 */
reportsRoutes.get(
  "/top-products",
  requireTenantScope,
  authorize(["report:read", "document:manage"]),
  validateTopProductsReportQuery,
  getTopProducts,
);

/**
 * @route GET /api/documents/reports/overdue-installments
 * @desc  List overdue payment installments across all documents
 * @access Private (report:read)
 */
reportsRoutes.get(
  "/overdue-installments",
  requireTenantScope,
  authorize(["report:read", "document:manage"]),
  validateOverdueInstallmentsQuery,
  getOverdueInstallments,
);

export default reportsRoutes;
