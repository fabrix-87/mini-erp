"use client";

import { buildQueryString } from "@/helpers/role-helper";
import api from "@/lib/client/api";
import {
  PermissionDeleteApiResponse,
  PermissionListApiResponse,
  PermissionSingleApiResponse,
  RoleDeleteApiResponse,
  RoleListApiResponse,
  RolePermissionsApiResponse,
  RoleSingleApiResponse,
} from "@/types/role";
import {
  AssignPermissionsInput,
  CreatePermissionInput,
  CreateRoleInput,
  PermissionQueryInput,
  RoleQueryInput,
  UpdatePermissionInput,
  UpdateRoleInput,
} from "@mini-erp/shared";

// ============================================================================
// CLIENT ROLE SERVICES (Browser only - React Query)
// ============================================================================

export const clientRoleService = {
  /**
   * Fetches all roles with filters and pagination
   */
  async getAll(params: RoleQueryInput): Promise<RoleListApiResponse> {
    const queryString = buildQueryString(params);
    const url = queryString ? `/roles?${queryString}` : "/roles";
    const { data } = await api.get<RoleListApiResponse>(url);
    return data;
  },

  /**
   * Fetches a single role by ID
   */
  async getById(id: number): Promise<RoleSingleApiResponse> {
    const { data } = await api.get<RoleSingleApiResponse>(`/roles/${id}`);
    return data;
  },

  /**
   * Creates a new role
   */
  async create(roleData: CreateRoleInput): Promise<RoleSingleApiResponse> {
    const { data } = await api.post<RoleSingleApiResponse>("/roles", roleData);
    return data;
  },

  /**
   * Updates an existing role
   */
  async update(id: number, roleData: UpdateRoleInput): Promise<RoleSingleApiResponse> {
    const { data } = await api.put<RoleSingleApiResponse>(`/roles/${id}`, roleData);
    return data;
  },

  /**
   * Deletes a role by ID
   */
  async delete(id: number): Promise<RoleDeleteApiResponse> {
    const { data } = await api.delete<RoleDeleteApiResponse>(`/roles/${id}`);
    return data;
  },

  /**
   * Fetches permissions assigned to a specific role
   */
  async getRolePermissions(id: number): Promise<RolePermissionsApiResponse> {
    const { data } = await api.get<RolePermissionsApiResponse>(`/roles/${id}/permissions`);
    return data;
  },

  /**
   * Assigns permissions to a role (additive)
   */
  async assignPermissions(
    id: number,
    body: AssignPermissionsInput,
  ): Promise<RoleSingleApiResponse> {
    const { data } = await api.post<RoleSingleApiResponse>(`/roles/${id}/permissions`, body);
    return data;
  },

  /**
   * Removes permissions from a role
   */
  async removePermissions(
    id: number,
    body: AssignPermissionsInput,
  ): Promise<RoleSingleApiResponse> {
    const { data } = await api.delete<RoleSingleApiResponse>(`/roles/${id}/permissions`, {
      data: body,
    });
    return data;
  },
};

// ============================================================================
// CLIENT PERMISSION SERVICES
// ============================================================================

export const clientPermissionService = {
  /**
   * Fetches all permissions with optional filters
   */
  async getAll(params?: PermissionQueryInput): Promise<PermissionListApiResponse> {
    const queryString = params ? buildQueryString(params as any) : "";
    const url = queryString ? `/roles/permissions?${queryString}` : "/roles/permissions";
    const { data } = await api.get<PermissionListApiResponse>(url);
    return data;
  },

  /**
   * Fetches a single permission by ID
   */
  async getById(id: number): Promise<PermissionSingleApiResponse> {
    const { data } = await api.get<PermissionSingleApiResponse>(`/roles/permissions/${id}`);
    return data;
  },

  /**
   * Creates a new permission
   */
  async create(permissionData: CreatePermissionInput): Promise<PermissionSingleApiResponse> {
    const { data } = await api.post<PermissionSingleApiResponse>(
      "/roles/permissions",
      permissionData,
    );
    return data;
  },

  /**
   * Updates an existing permission
   */
  async update(
    id: number,
    permissionData: UpdatePermissionInput,
  ): Promise<PermissionSingleApiResponse> {
    const { data } = await api.put<PermissionSingleApiResponse>(
      `/roles/permissions/${id}`,
      permissionData,
    );
    return data;
  },

  /**
   * Deletes a permission by ID
   */
  async delete(id: number): Promise<PermissionDeleteApiResponse> {
    const { data } = await api.delete<PermissionDeleteApiResponse>(`/roles/permissions/${id}`);
    return data;
  },
};

export default clientRoleService;
