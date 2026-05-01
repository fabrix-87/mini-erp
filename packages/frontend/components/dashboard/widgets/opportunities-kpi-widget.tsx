// packages/frontend/components/dashboard/widgets/opportunities-kpi-widget.tsx
import { Target } from "lucide-react";
import { WidgetWrapper } from "../widget-wrapper";
import { KpiStat } from "../kpi-stat";
import type { OpportunitiesKpiData } from "@mini-erp/shared";

interface Props {
  data?: OpportunitiesKpiData;
  isLoading: boolean;
  isEditMode: boolean;
}

const fmt = (v: string | undefined) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(parseFloat(v ?? "0"));

/** Opportunities KPI: pipeline, vinte, win rate, valore. */
export function OpportunitiesKpiWidget({ data, isLoading, isEditMode }: Props) {
  return (
    <WidgetWrapper
      title="Opportunità"
      isLoading={isLoading}
      isEditMode={isEditMode}
      isError={!isLoading && !data}
      skeletonRows={4}
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <KpiStat label="Totale" value={data?.total ?? 0} icon={Target} />
        <KpiStat label="Aperte" value={data?.open ?? 0} />
        <KpiStat
          label="Win rate"
          value={`${data?.winRate ?? "0.0"}%`}
          colorClass={parseFloat(data?.winRate ?? "0") > 0 ? "text-green-600" : undefined}
        />
        <KpiStat label="Pipeline" value={fmt(data?.totalPipelineValue)} />
      </div>
    </WidgetWrapper>
  );
}
