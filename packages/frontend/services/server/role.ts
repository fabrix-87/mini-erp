import { buildQueryString } from "@/helpers/role";
import { serverApi } from "@/lib/server/api";
import { RoleListApiResponse } from "@/types/role";
import { RoleQueryInput } from "@mini-erp/shared";

// ============================================================================
// SERVER ROLE ACTIONS
// ============================================================================

export const serverRoleService = {
  /**
   * Ottieni tutti i contatti con filtri e paginazione
   */
  async getAllRoles(params: RoleQueryInput): Promise<RoleListApiResponse> {
    const queryString = buildQueryString(params);
    const url = queryString ? `/roles?${queryString}` : "/roles";
    return await serverApi.get<RoleListApiResponse>(url, { unwrapData: false });
  },
};
