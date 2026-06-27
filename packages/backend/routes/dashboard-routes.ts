// ============================================================================
// UNIFIED DASHBOARD ROUTES
// ============================================================================

import { validateDashboardQuery, validateUpdateLayout } from "@/validators/dashboard-validator";
import {
  getUnifiedDashboard,
  updateDashboardLayout,
  resetDashboardLayout,
} from "@/controllers/dashboard-controller";
import { createHonoApp } from "@/lib/hono-app";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const dashboardRoutes = createHonoApp();

/**
 * GET /api/dashboard
 * Fetch unified dashboard data with all authorized widgets
 */
dashboardRoutes.get("/", requireTenantScope, validateDashboardQuery, getUnifiedDashboard);

/**
 * PUT /api/dashboard/layout
 * Save user's custom widget layout
 */
dashboardRoutes.put("/layout", requireTenantScope, validateUpdateLayout, updateDashboardLayout);

/**
 * DELETE /api/dashboard/layout
 * Reset layout to role default
 */
dashboardRoutes.delete("/layout", requireTenantScope, resetDashboardLayout);

export default dashboardRoutes;
