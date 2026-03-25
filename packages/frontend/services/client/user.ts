import { buildQueryString } from "@/helpers/role";
import api from "@/lib/client/api";
import { UserListApiResponse, UserSingleApiResponse } from "@/types/user";
import { UserQueryInput } from "@mini-erp/shared";

// ============================================================================
// CLIENT USER SERVICES (Browser only - React Query)
// ============================================================================

export const clientUserService = {
  /**
   * Fetches all users with filters and pagination
   */
  async getAll(params: UserQueryInput): Promise<UserListApiResponse> {
    const queryString = buildQueryString(params);
    const url = queryString ? `/users?${queryString}` : "/users";
    const { data } = await api.get<UserListApiResponse>(url);
    return data;
  },

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  }> {
    const users = (await this.getAll({
      page: 1,
      limit: 1000,
      sortBy: "createdAt",
      sortOrder: "asc",
    })) as UserListApiResponse;

    const stats = {
      total: users.pagination?.totalItems || 0,
      active: 0,
      inactive: 0,
      byRole: {} as Record<string, number>,
    };

    users.data.forEach((user) => {
      if (user.active) {
        stats.active++;
      } else {
        stats.inactive++;
      }

      user.roles?.forEach((role: any) => {
        stats.byRole[role.code] = (stats.byRole[role.code] || 0) + 1;
      });
    });

    return stats;
  },
};
