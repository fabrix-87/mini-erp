// packages/frontend/components/dashboard/widgets/leads-kpi-widget.tsx
import { Users } from "lucide-react";
import { WidgetWrapper } from "../widget-wrapper";
import { KpiStat } from "../kpi-stat";
import type { LeadsKpiData } from "@mini-erp/shared";

interface Props {
  data?: LeadsKpiData;
  isLoading: boolean;
  isEditMode: boolean;
}

/** Leads KPI: totale, attivi, tasso conversione, persi. */
export function LeadsKpiWidget({ data, isLoading, isEditMode }: Props) {
  return (
    <WidgetWrapper
      title="Leads"
      isLoading={isLoading}
      isEditMode={isEditMode}
      isError={!isLoading && !data}
      skeletonRows={4}
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <KpiStat label="Totale" value={data?.total ?? 0} icon={Users} />
        <KpiStat label="Attivi" value={data?.active ?? 0} />
        <KpiStat
          label="Tasso conversione"
          value={`${data?.conversionRate ?? "0.0"}%`}
          colorClass={parseFloat(data?.conversionRate ?? "0") > 0 ? "text-green-600" : undefined}
        />
        <KpiStat
          label="Persi"
          value={data?.lost ?? 0}
          colorClass={(data?.lost ?? 0) > 0 ? "text-red-500" : undefined}
        />
      </div>
    </WidgetWrapper>
  );
}
