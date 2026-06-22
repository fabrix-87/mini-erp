// packages/frontend/app/(protected)/dashboard/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { DashboardPeriod, DashboardScope } from "@mini-erp/shared";
import { dashboardKeys } from "@/types/dashboard";
import DashboardView from "./components/dashboard-view";
import { getDashboard } from "@/services/server/dashboard-service";


/**
 * Server Component: prefetches default dashboard data before sending HTML.
 * The client receives a pre-populated React Query cache via HydrationBoundary,
 * eliminating the loading flash on first render.
 */
export default async function DashboardPage() {
  const queryClient = new QueryClient();

  const defaultParams = {
    period: DashboardPeriod.CURRENT_MONTH,
    scope: DashboardScope.OWN,
    feedLimit: 10,
  };

  // Se il fetch fallisce (es. sessione scaduta) non bloccare il render —
  // il client gestirà l'errore con il suo error boundary / stato di errore.
  await queryClient.prefetchQuery({
    queryKey: dashboardKeys.data(defaultParams),
    queryFn: () => getDashboard(defaultParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardView />
    </HydrationBoundary>
  );
}