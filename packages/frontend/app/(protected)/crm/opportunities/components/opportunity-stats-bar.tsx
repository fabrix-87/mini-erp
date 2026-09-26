"use client";

import {
  TrendingUp,
  TrendingDown,
  Target,
  Banknote,
  Clock,
  Trophy,
  BarChart3,
  Percent,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import type { OpportunityStats } from "@/types/opportunity-types";
import { formatCurrency } from "@/utils/format-currency";
import { StatMetric, StatsGridColumns } from "@/types/stats-grid-types";
import { StatsGrid } from "@/components/stats-grid";

interface OpportunityStatsBarProps {
  stats: OpportunityStats;
}

/**
 * Builds localized KPI metrics for the CRM opportunity workspace.
 *
 * @param stats - Aggregated opportunity statistics from the API.
 * @param t - Translation function scoped to opportunity statistics.
 * @returns Ordered presentation metrics for the shared statistics grid.
 */
function buildOpportunityMetrics(
  s: OpportunityStats,
  t: ReturnType<typeof useTranslations>,
): StatMetric[] {
  return [
    {
      id: "total",
      kind: "value",
      label: t("total"),
      value: s.total,
      icon: BarChart3,
      priority: "primary",
    },
    {
      id: "open",
      kind: "value",
      label: t("open"),
      value: s.open,
      icon: TrendingUp,
      tone: "primary",
      priority: "primary",
    },
    {
      id: "won",
      kind: "value",
      label: t("won"),
      value: s.won,
      icon: Trophy,
      priority: "primary",
      tone: "success",
    },
    {
      id: "lost",
      kind: "value",
      label: t("lost"),
      value: s.lost,
      icon: TrendingDown,
      tone: "danger",
      priority: "primary",
    },
    {
      id: "winRate",
      kind: "value",
      label: t("winRate"),
      value: s.winRate.toFixed(1),
      suffix: "%",
      icon: Percent,
      tone: s.winRate >= 40 ? "success" : s.winRate >= 20 ? "danger" : "danger",
    },
    {
      id: "totalEstimatedValue",
      kind: "value",
      label: t("totalEstimatedValue"),
      value: formatCurrency(s.totalEstimatedValue),
      icon: Banknote,
      tone: "primary",
    },
    {
      id: "totalWeightedValue",
      kind: "value",
      label: t("totalWeightedValue"),
      value: formatCurrency(s.totalWeightedValue),
      icon: Target,
    },
    {
      id: "averageSalesCycle",
      kind: "value",
      label: t("averageSalesCycle"),
      value: s.averageSalesCycle,
      suffix: ` ${t("daysSuffix")}`,
      icon: Clock,
    },
  ];
}

/**
 * Horizontal KPI bar shown above the opportunity table.
 * Renders stat tiles derived from OpportunityStats.
 */
export function OpportunityStatsBar({ stats }: OpportunityStatsBarProps) {
  const t = useTranslations("crm.opportunities.stats");

  return (
    <StatsGrid
      metrics={buildOpportunityMetrics(stats, t)}
      ariaLabel={t("summary")}
      columns={StatsGridColumns.Four}
    />
  );
}
