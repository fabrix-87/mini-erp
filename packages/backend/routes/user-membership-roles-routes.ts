// packages/backend/routes/membership-roles-routes.ts

import { createHonoApp } from "@/lib/hono-app";
import { authenticateToken, authorize } from "@/middleware/auth-middleware";
import {
  validateMembershipUserId,
  validateAssignMembershipRoles,
  validateRemoveMembershipRoles,
} from "../validators/membership-roles-validator";
import {
  getMembershipRoles,
  getMembershipPermissions,
  replaceMembershipRoles,
  addMembershipRoles,
  removeMembershipRoles,
} from "../controllers/user-membership-roles-controller";

const membershipRolesRoutes = createHonoApp();

// ============================================================================
// READ
// ============================================================================

/**
 * @route   GET /api/memberships/:userId/roles
 * @desc    Returns roles assigned to a user in the current tenant
 * @access  Private/Admin (user:read | user:manage)
 */
membershipRolesRoutes.get(
  "/:userId/roles",
  authenticateToken,
  authorize(["user:read", "user:manage"]),
  validateMembershipUserId,
  getMembershipRoles,
);

/**
 * @route   GET /api/memberships/:userId/permissions
 * @desc    Returns effective permissions of a user in the current tenant
 * @access  Private/Admin (user:read | user:manage)
 */
membershipRolesRoutes.get(
  "/:userId/permissions",
  authenticateToken,
  authorize(["user:read", "user:manage"]),
  validateMembershipUserId,
  getMembershipPermissions,
);

// ============================================================================
// WRITE
// ============================================================================

/**
 * @route   PUT /api/memberships/:userId/roles
 * @desc    Replaces all roles for a user in the current tenant (full replace)
 * @access  Private/Admin (user:manage)
 */
membershipRolesRoutes.put(
  "/:userId/roles",
  authenticateToken,
  authorize(["user:manage"]),
  validateMembershipUserId,
  validateAssignMembershipRoles,
  replaceMembershipRoles,
);

/**
 * @route   POST /api/memberships/:userId/roles
 * @desc    Adds roles to a user in the current tenant (additive, no removal)
 * @access  Private/Admin (user:manage)
 */
membershipRolesRoutes.post(
  "/:userId/roles",
  authenticateToken,
  authorize(["user:manage"]),
  validateMembershipUserId,
  validateAssignMembershipRoles,
  addMembershipRoles,
);

/**
 * @route   DELETE /api/memberships/:userId/roles
 * @desc    Removes specific roles from a user in the current tenant
 * @access  Private/Admin (user:manage)
 */
membershipRolesRoutes.delete(
  "/:userId/roles",
  authenticateToken,
  authorize(["user:manage"]),
  validateMembershipUserId,
  validateRemoveMembershipRoles,
  removeMembershipRoles,
);

// ============================================================================
// EXPORT
// ============================================================================

export default membershipRolesRoutes;