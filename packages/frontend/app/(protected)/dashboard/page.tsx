"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardPeriod, DashboardScope, type WidgetPositionInput } from "@mini-erp/shared";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { toast } from "sonner";
import { dashboardKeys, DashboardQueryParams } from "@/types/dashboard";
import {
  useDashboard,
  useResetDashboardLayout,
  useSaveDashboardLayout,
} from "@/hooks/use-dashboard";
import DashboardSkeleton from "./loading";

/**
 * Scopes visibili all'utente: in futuro derivare da useAuth() → user.roles.
 * Per ora esposto come costante — rimpiazzare con logica ruolo reale.
 */
const ALLOWED_SCOPES: DashboardScope[] = [DashboardScope.OWN];

export default function DashboardPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useState<DashboardQueryParams>({
    period: DashboardPeriod.CURRENT_MONTH,
    scope: DashboardScope.OWN,
    feedLimit: 10,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  /**
   * localLayout: sovrascrive il layout del server durante l'edit mode.
   * Viene azzerato dopo il salvataggio o il reset.
   */
  const [localLayout, setLocalLayout] = useState<WidgetPositionInput[] | null>(null);

  const { data: dashboard, isLoading, isRefetching } = useDashboard(params);
  const saveLayout = useSaveDashboardLayout();
  const resetLayout = useResetDashboardLayout();

  // Layout attivo: locale (in modifica) oppure quello ritornato dal server
  const activeLayout = localLayout ?? dashboard?.data.layout ?? [];

  const handleParamsChange = useCallback(
    (patch: Partial<DashboardQueryParams>) => setParams((prev) => ({ ...prev, ...patch })),
    [],
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.data(params) });
  }, [queryClient, params]);

  const handleLayoutChange = useCallback(
    (newLayout: WidgetPositionInput[]) => setLocalLayout(newLayout),
    [],
  );

  const handleToggleEditMode = async () => {
    if (isEditMode && localLayout) {
      try {
        await saveLayout.mutateAsync(localLayout);
        toast.success("Layout salvato");
        setLocalLayout(null);
      } catch {
        toast.error("Errore nel salvataggio del layout");
        return; // Non uscire dall'edit mode se il salvataggio fallisce
      }
    }
    setIsEditMode((v) => !v);
  };

  const handleResetLayout = async () => {
    try {
      await resetLayout.mutateAsync();
      setLocalLayout(null);
      setIsEditMode(false);
      toast.success("Layout ripristinato al default");
    } catch {
      toast.error("Errore nel reset del layout");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader
        params={params}
        allowedScopes={ALLOWED_SCOPES}
        isEditMode={isEditMode}
        isSaving={saveLayout.isPending || resetLayout.isPending}
        isLoading={isLoading || isRefetching}
        onChange={handleParamsChange}
        onRefresh={handleRefresh}
        onResetLayout={handleResetLayout}
        onToggleEditMode={handleToggleEditMode}
      />
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <DashboardGrid
          layout={activeLayout}
          widgets={dashboard?.data.widgets ?? {}}
          isEditMode={isEditMode}
          isLoading={isLoading}
          onLayoutChange={handleLayoutChange}
        />
      )}
    </div>
  );
}
