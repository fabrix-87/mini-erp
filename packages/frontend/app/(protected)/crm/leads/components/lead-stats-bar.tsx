"use client";

import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Clock,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { LeadStats } from "@mini-erp/shared";
import { StatsGrid, type StatMetric } from "@/components/stats-grid";
import { formatCurrency } from "@/utils/format-currency";

interface LeadStatsBarProps {
  stats: LeadStats;
}

/**
 * Builds localized KPI metrics for the CRM leads workspace.
 *
 * @param stats - Aggregated lead statistics from the API.
 * @param t - Translation function scoped to lead statistics.
 * @returns Ordered presentation metrics for the shared statistics grid.
 */
function buildLeadMetrics(stats: LeadStats, t: ReturnType<typeof useTranslations>): StatMetric[] {
  return [
    {
      id: "total",
      kind: "value",
      label: t("total"),
      value: stats.total,
      icon: Users,
      priority: "primary",
    },
    {
      id: "new-this-month",
      kind: "value",
      label: t("newThisMonth"),
      value: stats.newThisMonth,
      icon: TrendingUp,
      tone: "primary",
      priority: "primary",
    },
    {
      id: "converted",
      kind: "value",
      label: t("converted"),
      value: stats.converted,
      icon: CheckCircle2,
      tone: "success",
      priority: "primary",
    },
    {
      id: "conversion-rate",
      kind: "value",
      label: t("conversionRate"),
      value: stats.conversionRate,
      suffix: "%",
      icon: TrendingUp,
      tone:
        stats.conversionRate >= 20 ? "success" : stats.conversionRate >= 10 ? "warning" : "danger",
      priority: "primary",
    },
    {
      id: "estimated-value",
      kind: "value",
      label: t("totalEstimatedValue"),
      value: formatCurrency(stats.totalEstimatedValue),
      icon: Banknote,
      tone: "success",
      priority: "primary",
    },
    {
      id: "overdue-follow-up",
      kind: "value",
      label: t("overdueFollowUp"),
      value: stats.overdueFollowUp,
      icon: AlertTriangle,
      tone: stats.overdueFollowUp > 0 ? "danger" : "default",
      priority: "primary",
    },
    {
      id: "new-this-week",
      kind: "value",
      label: t("newThisWeek"),
      value: stats.newThisWeek,
      icon: CalendarClock,
    },
    {
      id: "lost",
      kind: "value",
      label: t("lost"),
      value: stats.lost,
      icon: TrendingDown,
      tone: stats.lost > 0 ? "danger" : "default",
    },
    {
      id: "average-score",
      kind: "value",
      label: t("averageScore"),
      value: stats.averageScore,
      suffix: "/100",
      icon: Star,
      tone: stats.averageScore >= 70 ? "success" : stats.averageScore >= 40 ? "warning" : "default",
    },
    {
      id: "average-conversion-time",
      kind: "value",
      label: t("averageConversionTime"),
      value: stats.averageConversionTime,
      suffix: ` ${t("daysSuffix")}`,
      icon: Clock,
    },
    {
      id: "qualified-leads",
      kind: "value",
      label: t("qualifiedLeads"),
      value: stats.qualifiedLeads,
      icon: Target,
    },
    {
      id: "need-follow-up",
      kind: "value",
      label: t("needFollowUp"),
      value: stats.needFollowUp,
      icon: CalendarClock,
      tone: stats.needFollowUp > 0 ? "warning" : "default",
    },
  ];
}

/**
 * Renders CRM lead KPIs above the leads table.
 *
 * @param props - Aggregated lead statistics.
 * @returns Shared KPI grid configured for CRM leads.
 */
export function LeadStatsBar({ stats }: LeadStatsBarProps): React.JSX.Element {
  const t = useTranslations("crm.leads.stats");

  return <StatsGrid metrics={buildLeadMetrics(stats, t)} ariaLabel={t("summary")} />;
}
