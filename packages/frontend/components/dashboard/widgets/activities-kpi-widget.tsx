// packages/frontend/components/dashboard/widgets/activities-kpi-widget.tsx
import { Activity } from "lucide-react";
import { WidgetWrapper } from "../widget-wrapper";
import { KpiStat } from "../kpi-stat";
import type { ActivitiesKpiData } from "@mini-erp/shared";

interface Props {
  data?: ActivitiesKpiData;
  isLoading: boolean;
  isEditMode: boolean;
}

/** Activities KPI: totale, scadute, oggi, completate. */
export function ActivitiesKpiWidget({ data, isLoading, isEditMode }: Props) {
  return (
    <WidgetWrapper
      title="Attività"
      isLoading={isLoading}
      isEditMode={isEditMode}
      isError={!isLoading && !data}
      skeletonRows={4}
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <KpiStat label="Totale" value={data?.total ?? 0} icon={Activity} />
        <KpiStat
          label="Scadute"
          value={data?.overdue ?? 0}
          colorClass={(data?.overdue ?? 0) > 0 ? "text-red-500" : undefined}
        />
        <KpiStat label="Oggi" value={data?.today ?? 0} />
        <KpiStat label="Completate" value={data?.completed ?? 0} colorClass="text-green-600" />
      </div>
    </WidgetWrapper>
  );
}
