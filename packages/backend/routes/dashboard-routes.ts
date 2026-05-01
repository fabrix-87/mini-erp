// ============================================================================
// UNIFIED DASHBOARD ROUTES
// ============================================================================

import { authenticateToken } from "@/middleware/auth-middleware";
import {
  validateDashboardQuery,
  validateUpdateLayout,
} from "@/validators/dashboard-validator";
import {
  getUnifiedDashboard,
  updateDashboardLayout,
  resetDashboardLayout,
} from "@/controllers/dashboard-controller";
import { createHonoApp } from "@/lib/hono-app";

const dashboardRoutes = createHonoApp();

/**
 * GET /api/dashboard
 * Fetch unified dashboard data with all authorized widgets
 */
dashboardRoutes.get(
  "/",
  authenticateToken,
  validateDashboardQuery,
  getUnifiedDashboard,
);

/**
 * PUT /api/dashboard/layout
 * Save user's custom widget layout
 */
dashboardRoutes.put(
  "/layout",
  authenticateToken,
  validateUpdateLayout,
  updateDashboardLayout,
);

/**
 * DELETE /api/dashboard/layout
 * Reset layout to role default
 */
dashboardRoutes.delete(
  "/layout",
  authenticateToken,
  resetDashboardLayout,
);

export default dashboardRoutes;
