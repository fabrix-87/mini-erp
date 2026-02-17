import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import {
  assignPermissionsSchema,
  assignRolesToUserSchema,
  checkPermissionSchema,
  createPermissionSchema,
  createRoleSchema,
  permissionIdParamSchema,
  permissionQuerySchema,
  removePermissionsSchema,
  roleCodeParamSchema,
  roleIdParamSchema,
  roleQuerySchema,
  updatePermissionSchema,
  updateRoleSchema,
} from "@mini-erp/shared/validators/role";

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

// ROLES
export const validateCreateRole = validateBody(
  createRoleSchema,
  "Role creation"
);

export const validateUpdateRole = validateBody(updateRoleSchema, "Role update");

export const validateRoleId = validateParams(
  roleIdParamSchema,
  "Role ID validation"
);

export const validateRoleCode = validateParams(
  roleCodeParamSchema,
  "Role code validation"
);

export const validateRoleQuery = validateQuery(roleQuerySchema, "Role query");

export const validateAssignPermissions = validateBody(
  assignPermissionsSchema,
  "Assign permissions"
);

export const validateRemovePermissions = validateBody(
  removePermissionsSchema,
  "Remove permissions"
);

// PERMISSIONS
export const validateCreatePermission = validateBody(
  createPermissionSchema,
  "Permission creation",
);

export const validateUpdatePermission = validateBody(
  updatePermissionSchema,
  "Permission update"
);

export const validatePermissionId = validateParams(
  permissionIdParamSchema,
  "Permission ID validation"
);

export const validatePermissionQuery = validateQuery(
  permissionQuerySchema,
  "Permission query"
);

export const validateAssignRolesToUser = validateBody(
  assignRolesToUserSchema,
  "Assign roles to user"  
);

export const validateCheckPermission = validateBody(
  checkPermissionSchema,
  "Check permission",
);
