// ============================================================================
// UNIFIED DASHBOARD ROUTES
// ============================================================================

import { Router } from "express";
import { authenticateToken } from "@/middleware/auth";
import {
  validateDashboardQuery,
  validateUpdateLayout,
} from "@/validators/dashboard";
import {
  getUnifiedDashboard,
  updateDashboardLayout,
  resetDashboardLayout,
} from "@/controllers/dashboard";

const router = Router();

/**
 * GET /api/dashboard
 * Fetch unified dashboard data with all authorized widgets
 */
router.get(
  "/",
  authenticateToken,
  validateDashboardQuery,
  getUnifiedDashboard,
);

/**
 * PUT /api/dashboard/layout
 * Save user's custom widget layout
 */
router.put(
  "/layout",
  authenticateToken,
  validateUpdateLayout,
  updateDashboardLayout,
);

/**
 * DELETE /api/dashboard/layout
 * Reset layout to role default
 */
router.delete(
  "/layout",
  authenticateToken,
  resetDashboardLayout,
);

export default router;
