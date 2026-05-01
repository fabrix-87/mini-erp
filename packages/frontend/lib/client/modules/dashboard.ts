// packages/frontend/lib/client/modules/dashboard.ts

import { default as apiClient } from "../api";
import { DashboardQueryParams } from "@/types/dashboard";
import { WidgetPositionInput, DashboardApiResponse } from "@mini-erp/shared";

// ============================================================================
// CLIENT DASHBOARD SERVICES (Browser only - React Query)
// ============================================================================

export const clientDashboardService = {
  async getDashboard(params: DashboardQueryParams): Promise<DashboardApiResponse> {
    const response = await apiClient.get<DashboardApiResponse>("/dashboard", { params });
    return response.data;
  },

  async saveLayout(widgets: WidgetPositionInput[]): Promise<void> {
    await apiClient.put("/dashboard/layout", { widgets });
  },

  async resetLayout(): Promise<void> {
    await apiClient.delete("/dashboard/layout");
  }
};
