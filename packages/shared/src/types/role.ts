// ============================================================================
// TYPE EXPORTS
// ============================================================================

import z from "zod";
import {
  AssignPermissionsSchema,
  CreatePermissionSchema,
  CreateRoleSchema,
  PermissionQuerySchema,
  RoleQuerySchema,
  UpdatePermissionSchema,
  UpdateRoleSchema,
} from "../validators/role";

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
export type AssignPermissionsInput = z.infer<typeof AssignPermissionsSchema>;
export type CreatePermissionInput = z.infer<typeof CreatePermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof UpdatePermissionSchema>;
export type RoleQueryInput = z.infer<typeof RoleQuerySchema>;
export type PermissionQueryInput = z.infer<typeof PermissionQuerySchema>;
