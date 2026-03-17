// services/server/role.ts
import { serverApi } from "@/lib/server/api";
import { buildQueryString } from "@/helpers/role";
import type { ApiResponse } from "@/types/api";
import type {
  AssignRemovePermissionsResponse,
  RoleListApiResponse,
  RoleSingleApiResponse,
} from "@/types/role";
import type { CreateRoleInput, UpdateRoleInput, RoleQueryInput } from "@mini-erp/shared";

// ============================================================================
// READ
// ============================================================================

/**
 * Get all roles with filters and pagination
 */
export async function getAllRoles(params: RoleQueryInput): Promise<RoleListApiResponse> {
  const queryString = buildQueryString(params);
  const url = queryString ? `/roles?${queryString}` : "/roles";
  return serverApi.get<RoleListApiResponse>(url, { unwrapData: false });
}

/**
 * Get single role by ID (includes permissions)
 */
export async function getRoleById(id: number): Promise<RoleSingleApiResponse> {
  return serverApi.get<RoleSingleApiResponse>(`/roles/${id}`, {unwrapData: false});
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new role
 */
export async function createRole(data: CreateRoleInput): Promise<RoleSingleApiResponse> {
  return serverApi.post<RoleSingleApiResponse>("/roles", data);
}

/**
 * Update an existing role
 */
export async function updateRole(
  id: number,
  data: UpdateRoleInput,
): Promise<RoleSingleApiResponse> {
  return serverApi.put<RoleSingleApiResponse>(`/roles/${id}`, data);
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
