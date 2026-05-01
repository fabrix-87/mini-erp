// packages/frontend/components/dashboard/widgets/revenue-kpi-widget.tsx
import { Euro } from "lucide-react";
import { WidgetWrapper } from "../widget-wrapper";
import { KpiStat } from "../kpi-stat";
import type { RevenueKpiData } from "@mini-erp/shared";

interface Props {
  data?: RevenueKpiData;
  isLoading: boolean;
  isEditMode: boolean;
}

const fmt = (v: string | undefined) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(parseFloat(v ?? "0"));

/** Revenue KPI: fatturato, incassato, in attesa, crescita. */
export function RevenueKpiWidget({ data, isLoading, isEditMode }: Props) {
  return (
    <WidgetWrapper
      title="Ricavi"
      isLoading={isLoading}
      isEditMode={isEditMode}
      isError={!isLoading && !data}
      skeletonRows={4}
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <KpiStat
          label="Fatturato totale"
          value={fmt(data?.totalRevenue)}
          icon={Euro}
          growthRate={data?.growthRate}
        />
        <KpiStat label="Incassato" value={fmt(data?.paidRevenue)} colorClass="text-green-600" />
        <KpiStat label="In attesa" value={fmt(data?.pendingRevenue)} />
        <KpiStat
          label="Fatture"
          value={data?.invoicesCount ?? 0}
          description={data ? `Media: ${fmt(data.averageInvoiceValue)}` : undefined}
        />
      </div>
    </WidgetWrapper>
  );
}
