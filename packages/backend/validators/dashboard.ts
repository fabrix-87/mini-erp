// ============================================================================
// DASHBOARD VALIDATORS
// ============================================================================

import {
  dashboardQuerySchema,
  updateLayoutSchema,
  dashboardUserParamSchema,
} from "@mini-erp/shared";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

/**
 * Validates GET /dashboard query string.
 * Covers period, scope, targetUserId, customFrom, customTo, feedLimit.
 */
export const validateDashboardQuery = validateQuery(
  dashboardQuerySchema,
  "Dashboard query",
);

/**
 * Validates PUT /dashboard/layout body.
 * Payload contains the array of widget configurations.
 */
export const validateUpdateLayout = validateBody(
  updateLayoutSchema,
  "Dashboard layout update",
);

/**
 * Validates route parameter :userId for admin-scoped dashboard endpoints.
 * Example: GET /dashboard/:userId (admin only).
 */
export const validateDashboardUserId = validateParams(
  dashboardUserParamSchema,
  "Dashboard user ID",
);
