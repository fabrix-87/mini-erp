"use client";

import {  
  Warehouse,
  PackageOpen,
  Monitor,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { StatMetric, StatsGridColumns } from "@/types/stats-grid-types";
import { StatsGrid } from "@/components/stats-grid";
import { WarehouseListStats } from "@mini-erp/shared";

interface WarehouseListStatsBarProps {
  stats: WarehouseListStats;
}

/**
 * Builds localized KPI metrics for the Warehouse workspace.
 *
 * @param stats - Aggregated statistics from the API.
 * @param t - Translation function scoped to statistics.
 * @returns Ordered presentation metrics for the shared statistics grid.
 */
function buildWarehouseMetrics(
  s: WarehouseListStats,
  t: ReturnType<typeof useTranslations>,
): StatMetric[] {
  return [
    {
      id: "warehouses",
      kind: "breakdown",
      label: t("warehouses"),
      icon: Warehouse,
      tone: "primary",
      rows: Object.entries(s.warehouses ?? {}).map(([label, count]) => ({
        id: label,
        label: t(label),
        value: count,
      })),
    },
    {
      id: "physicalStock",
      kind: "breakdown",
      label: t("physicalStock"),
      icon: PackageOpen,
      tone: "primary",
      rows: Object.entries(s.physicalStock ?? {}).map(([label, count]) => ({
        id: label,
        label: t(label),
        value: count,
      })),
    },
    {
      id: "virtualStock",
      kind: "breakdown",
      label: t("virtualStock"),
      icon: Monitor,
      tone: "primary",
      rows: Object.entries(s.virtualStock ?? {}).map(([label, count]) => ({
        id: label,
        label: t(label),
        value: count,
      })),
    },
  ];
}

/**
 * Horizontal KPI bar shown above the table.
 * Renders stat tiles derived from WarehouseListStats.
 */
export function WarehouseListStatsBar({ stats }: WarehouseListStatsBarProps) {
  const t = useTranslations("warehouse.stats");

  return (
    <StatsGrid
      metrics={buildWarehouseMetrics(stats, t)}
      ariaLabel={t("summary")}
      columns={StatsGridColumns.Three}
      className="pb-5"
    />
  );
}
