// services/server/role.ts
import { serverApi } from "@/lib/server/api";
import { buildQueryString } from "@/helpers/role-helper";
import type { ApiResponse } from "@/types/api";
import type {
  AssignRemovePermissionsResponse,
  RoleListApiResponse,
  RoleSingleApiResponse,
} from "@/types/role";
import type { CreateRoleInput, UpdateRoleInput, RoleQueryInput, Role } from "@mini-erp/shared";

// ============================================================================
// Cache Tags
// ============================================================================

const ROLE_TAGS = {
  list: "roles-list",
  detail: (id: number) => `role-${id}`,
};

// ============================================================================
// READ
// ============================================================================

/**
 * Get all roles with filters and pagination
 */
export async function getAllRoles(
  params: RoleQueryInput,
  revalidate?: number | false,
): Promise<RoleListApiResponse> {
  return serverApi.get<RoleListApiResponse>("/roles", {
    params,
    revalidate: revalidate ?? 30,
    tags: [ROLE_TAGS.list],
    unwrapData: false,
  });
}

/**
 * Get single role by ID (includes permissions)
 */
export async function getRoleById(
  id: number,
  options?: { revalidate?: number | false },
): Promise<RoleSingleApiResponse> {
  return serverApi.get<RoleSingleApiResponse>(`/roles/${id}`, { 
    revalidate: options?.revalidate ?? 60,
    tags: [ROLE_TAGS.detail(id), ROLE_TAGS.list],
    unwrapData: false
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new role
 */
export async function createRole(data: CreateRoleInput): Promise<Role> {
  return serverApi.post<Role>("/roles", data);
}

/**
 * Update an existing role
 */
export async function updateRole(id: number, data: UpdateRoleInput): Promise<Role> {
  return serverApi.put<Role>(`/roles/${id}`, data);
}

/**
 * Delete a role by ID
 */
export async function deleteRole(id: number): Promise<ApiResponse<null>> {
  return serverApi.delete<ApiResponse<null>>(`/roles/${id}`);
}

// ============================================================================
// PERMISSIONS
// ============================================================================

/**
 * Assign permissions to a role
 */
export async function assignPermissions(
  roleId: number,
  data: { permissionIds: number[] },
): Promise<AssignRemovePermissionsResponse> {
  return serverApi.post<AssignRemovePermissionsResponse>(`/roles/${roleId}/permissions`, data);
}

/**
 * Remove permissions from a role
 */
export async function removePermissions(
  roleId: number,
  data: { permissionIds: number[] },
): Promise<AssignRemovePermissionsResponse> {
  return serverApi.delete<AssignRemovePermissionsResponse>(`/roles/${roleId}/permissions`, {
    data,
  });
}
