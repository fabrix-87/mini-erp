// packages/frontend/hooks/use-dashboard.ts

import { type WidgetPositionInput } from "@mini-erp/shared";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys, DashboardQueryParams } from "@/types/dashboard";
import { clientDashboardService } from "@/lib/client/modules/dashboard";

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetches full dashboard data for enabled widgets.
 * Automatically refetches when params change.
 */
export function useDashboard(params: DashboardQueryParams = {}) {
  return useQuery({
    queryKey: dashboardKeys.data(params),
    queryFn: () => clientDashboardService.getDashboard(params),
    staleTime: 1000 * 60 * 2, // 2 min cache
  });
}

/**
 * Saves user's custom widget layout to the server.
 * Invalidates dashboard query on success.
 */
export function useSaveDashboardLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (widgets: WidgetPositionInput[]) => clientDashboardService.saveLayout(widgets),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

/**
 * Resets the user's layout to their role's default.
 */
export function useResetDashboardLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clientDashboardService.resetLayout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
