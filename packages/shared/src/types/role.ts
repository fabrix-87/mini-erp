// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import {
  assignPermissionsSchema,
  createPermissionSchema,
  createRoleSchema,
  permissionIdParamSchema,
  permissionQuerySchema,
  roleIdParamSchema,
  roleQuerySchema,
  updatePermissionSchema,
  updateRoleSchema,
} from "../validators";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Role entity
 */
export type Role = {
  id: number;
  code: string;
  name: string;
  description?: string;
  isDefault: boolean;
  permissions?: Permission[];
};

/**
 * Permission entity
 */
export type Permission = {
  id: number;
  code: string;
  resource: string;
  action: string;
  description?: string;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignPermissionsInput = z.infer<typeof assignPermissionsSchema>;
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================
export type RoleQueryInput = z.infer<typeof roleQuerySchema>;
export type PermissionQueryInput = z.infer<typeof permissionQuerySchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================
export type RoleIdParam = z.infer<typeof roleIdParamSchema>;
export type PermissionIdParam = z.infer<typeof permissionIdParamSchema>;
