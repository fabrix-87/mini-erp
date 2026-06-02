// services/server/permission.ts
import { serverApi } from "@/lib/server/api";
import type { ApiResponse } from "@/types/api";
import { PermissionListApiResponse, PermissionSingleApiResponse } from "@/types/role-types";
import type { CreatePermissionInput, UpdatePermissionInput } from "@mini-erp/shared";

// ============================================================================
// READ
// ============================================================================

/**
 * Get all permissions
 */
export async function getAllPermissions(): Promise<PermissionListApiResponse> {
  return serverApi.get<PermissionListApiResponse>("/roles/permissions");
}

/**
 * Get single permission by ID
 */
export async function getPermissionById(id: number): Promise<PermissionSingleApiResponse> {
  return serverApi.get<PermissionSingleApiResponse>(`/roles/permissions/${id}`);
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new permission
 */
export async function createPermission(
  data: CreatePermissionInput,
): Promise<PermissionSingleApiResponse> {
  return serverApi.post<PermissionSingleApiResponse>("/roles/permissions", data);
}

/**
 * Update an existing permission
 */
export async function updatePermission(
  id: number,
  data: UpdatePermissionInput,
): Promise<PermissionSingleApiResponse> {
  return serverApi.put<PermissionSingleApiResponse>(`/roles/permissions/${id}`, data);
}

/**
 * Delete a permission by ID
 */
export async function deletePermission(id: number): Promise<ApiResponse<null>> {
  return serverApi.delete<ApiResponse<null>>(`/roles/permissions/${id}`);
}
