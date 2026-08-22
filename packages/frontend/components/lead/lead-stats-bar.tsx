"use client";

import {
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  Star,
  Clock,
  AlertTriangle,
  CalendarClock,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { LeadStats } from "@mini-erp/shared";
import { formatCurrency } from "@/utils/format-currency";

// ============================================================================
// Props
// ============================================================================

interface LeadStatsBarProps {
  stats: LeadStats;
}

// ============================================================================
// Tile config
// ============================================================================

interface StatTile {
  key: string;
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ElementType;
  /** Optional highlight color class for the value */
  colorClass?: string;
}

function buildTiles(s: LeadStats, t: ReturnType<typeof useTranslations>): StatTile[] {
  return [
    {
      key: "total",
      label: t("total"),
      value: s.total,
      icon: Users,
    },
    {
      key: "newThisMonth",
      label: t("newThisMonth"),
      value: s.newThisMonth,
      icon: TrendingUp,
      colorClass: "text-blue-600 dark:text-blue-400",
    },
    {
      key: "newThisWeek",
      label: t("newThisWeek"),
      value: s.newThisWeek,
      icon: CalendarClock,
    },
    {
      key: "converted",
      label: t("converted"),
      value: s.converted,
      icon: CheckCircle2,
      colorClass: "text-green-600 dark:text-green-400",
    },
    {
      key: "conversionRate",
      label: t("conversionRate"),
      value: s.conversionRate,
      suffix: "%",
      icon: TrendingUp,
      colorClass:
        s.conversionRate >= 20
          ? "text-green-600 dark:text-green-400"
          : s.conversionRate >= 10
            ? "text-yellow-600 dark:text-yellow-400"
            : "text-red-600 dark:text-red-400",
    },
    {
      key: "lost",
      label: t("lost"),
      value: s.lost,
      icon: TrendingDown,
      colorClass: s.lost > 0 ? "text-red-600 dark:text-red-400" : undefined,
    },
    {
      key: "averageScore",
      label: t("averageScore"),
      value: s.averageScore,
      suffix: "/100",
      icon: Star,
      colorClass:
        s.averageScore >= 70
          ? "text-green-600 dark:text-green-400"
          : s.averageScore >= 40
            ? "text-yellow-600 dark:text-yellow-400"
            : undefined,
    },
    {
      key: "averageConversionTime",
      label: t("averageConversionTime"),
      value: s.averageConversionTime,
      suffix: ` ${t("daysSuffix")}`,
      icon: Clock,
    },
    {
      key: "totalEstimatedValue",
      label: t("totalEstimatedValue"),
      value: formatCurrency(s.totalEstimatedValue),
      icon: Banknote,
      colorClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "qualifiedLeads",
      label: t("qualifiedLeads"),
      value: s.qualifiedLeads,
      icon: Target,
    },
    {
      key: "needFollowUp",
      label: t("needFollowUp"),
      value: s.needFollowUp,
      icon: CalendarClock,
    },
    {
      key: "overdueFollowUp",
      label: t("overdueFollowUp"),
      value: s.overdueFollowUp,
      icon: AlertTriangle,
      colorClass: s.overdueFollowUp > 0 ? "text-red-600 dark:text-red-400" : undefined,
    },
  ];
}

// ============================================================================
// Component
// ============================================================================

/**
 * Horizontal stats bar shown above the leads table.
 * Renders a responsive grid of KPI tiles derived from LeadStats.
 */
export function LeadStatsBar({ stats }: LeadStatsBarProps) {
  const t = useTranslations("crm.leads.stats");
  const tiles = buildTiles(stats, t);

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {tiles.map(({ key, label, value, suffix, icon: Icon, colorClass }) => (
        <Card key={key} className="overflow-hidden">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-muted-foreground leading-tight">{label}</p>
              <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>
            <p className={`text-xl font-bold tabular-nums ${colorClass ?? ""}`}>
              {value}
              {suffix && (
                <span className="text-xs font-normal text-muted-foreground ml-0.5">{suffix}</span>
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
