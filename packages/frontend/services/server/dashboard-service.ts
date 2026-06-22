import { serverApi } from "@/lib/server/api";
import { DashboardApiResponse, DashboardQueryParams } from "@/types/dashboard";

/**
 * Get dashboard data
 */
export async function getDashboard(params: DashboardQueryParams): Promise<DashboardApiResponse> {
  return await serverApi.get<DashboardApiResponse>("/dashboard", { params, unwrapData: false });
}
