import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import {
  AssignPermissionsSchema,
  AssignRolesToUserSchema,
  CheckPermissionSchema,
  CreatePermissionSchema,
  CreateRoleSchema,
  PermissionIdParamSchema,
  PermissionQuerySchema,
  RemovePermissionsSchema,
  RoleCodeParamSchema,
  RoleIdParamSchema,
  RoleQuerySchema,
  UpdatePermissionSchema,
  UpdateRoleSchema,
} from "@mini-erp/shared/validators/role";

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

// ROLES
export const validateCreateRole = validateBody(
  CreateRoleSchema,
  "Role creation"
);

export const validateUpdateRole = validateBody(UpdateRoleSchema, "Role update");

export const validateRoleId = validateParams(
  RoleIdParamSchema,
  "Role ID validation"
);

export const validateRoleCode = validateParams(
  RoleCodeParamSchema,
  "Role code validation"
);

export const validateRoleQuery = validateQuery(RoleQuerySchema, "Role query");

export const validateAssignPermissions = validateBody(
  AssignPermissionsSchema,
  "Assign permissions"
);

export const validateRemovePermissions = validateBody(
  RemovePermissionsSchema,
  "Remove permissions"
);

// PERMISSIONS
export const validateCreatePermission = validateBody(
  CreatePermissionSchema,
  "Permission creation",
);

export const validateUpdatePermission = validateBody(
  UpdatePermissionSchema,
  "Permission update"
);

export const validatePermissionId = validateParams(
  PermissionIdParamSchema,
  "Permission ID validation"
);

export const validatePermissionQuery = validateQuery(
  PermissionQuerySchema,
  "Permission query"
);

export const validateAssignRolesToUser = validateBody(
  AssignRolesToUserSchema,
  "Assign roles to user"  
);

export const validateCheckPermission = validateBody(
  CheckPermissionSchema,
  "Check permission",
);
