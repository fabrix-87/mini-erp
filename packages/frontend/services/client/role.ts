'use client'

import { buildQueryString } from "@/helpers/role";
import api from "@/lib/client/api";
import { RoleDeleteApiResponse, RoleListApiResponse, RoleSingleApiResponse } from "@/types/role";
import { CreateRoleInput, RoleQueryInput, UpdateRoleInput } from "@mini-erp/shared";

// ============================================================================
// CLIENT ROLE SERVICES (Browser only - React Query)
// ============================================================================

export const clientRoleService = {
  /**
   * Ottieni tutti i ruoli con filtri e paginazione
   */
  async getAll(params: RoleQueryInput): Promise<RoleListApiResponse> {
    const queryString = buildQueryString(params);
    const url = queryString ? `/roles?${queryString}` : '/roles';
    const { data } = await api.get<RoleListApiResponse>(url);
    return data;
  },

  /**
   * Ottieni singolo ruolo per ID
   */
  async getById(id: number): Promise<RoleSingleApiResponse> {
    const { data } = await api.get<RoleSingleApiResponse>(`/roles/${id}`);
    return data;
  },

  /**
   * Crea nuovo ruolo
   */
  async create(roleData: CreateRoleInput): Promise<RoleSingleApiResponse> {
    const { data } = await api.post<RoleSingleApiResponse>('/roles', roleData);
    return data;
  },

  /**
   * Aggiorna ruolo esistente
   */
  async update(id: number, roleData: UpdateRoleInput): Promise<RoleSingleApiResponse> {
    const { data } = await api.put<RoleSingleApiResponse>(
      `/roles/${id}`,
      roleData
    );
    return data;
  },

  /**
   * Elimina ruolo
   */
  async delete(id: number): Promise<RoleDeleteApiResponse> {
    const { data } = await api.delete<RoleDeleteApiResponse>(`/roles/${id}`);
    return data;
  },
}

export default clientRoleService;