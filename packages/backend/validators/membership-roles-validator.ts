// packages/backend/validators/membership-roles-validator.ts

import { validateBody, validateParams } from "@/middleware/validation-middleware";
import {
  assignRolesToUserSchema,
  removeRolesToUserSchema,
  membershipUserIdParamSchema,
} from "@mini-erp/shared";

// ============================================================================
// MEMBERSHIP ROLES - VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Validates the userId route parameter for membership-scoped endpoints.
 */
export const validateMembershipUserId = validateParams(
  membershipUserIdParamSchema,
  "Membership user ID validation",
);

/**
 * Validates the body for role assignment to a membership.
 */
export const validateAssignMembershipRoles = validateBody(
  assignRolesToUserSchema,
  "Assign membership roles",
);

/**
 * Validates the body for role removal from a membership.
 */
export const validateRemoveMembershipRoles = validateBody(
  removeRolesToUserSchema,
  "Remove membership roles",
);