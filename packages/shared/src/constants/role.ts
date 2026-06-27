import { z } from "zod";
import { roleSortFieldSchema } from "../validators";

export type RoleSortField = z.infer<typeof roleSortFieldSchema>;

export const ROLE_SYSTEM_DEFAULT = ["ADMIN", "SALES", "USER", "WAREHOUSE", "MANAGER"] as const;

export type RoleSystemDefault = (typeof ROLE_SYSTEM_DEFAULT)[number];

/**
 * Permission code in the format `resource:action`.
 * @example "user:read" | "invoice:create" | "role:manage"
 */
export type PermissionCode = `${string}:${string}`;

/** Result of an entity permission check. */
export interface EntityPermissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManage: boolean;
}
