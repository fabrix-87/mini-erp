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

interface OpportunityStatsBarProps {
  stats: OpportunityStats;
}

interface StatTile {
  key: string;
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ElementType;
  colorClass?: string;
}

function buildTiles(s: OpportunityStats, t: ReturnType<typeof useTranslations>): StatTile[] {
  return [
    {
      key: "total",
      label: t("total"),
      value: s.total,
      icon: BarChart3,
    },
    {
      key: "open",
      label: t("open"),
      value: s.open,
      icon: TrendingUp,
      colorClass: "text-blue-600 dark:text-blue-400",
    },
    {
      key: "won",
      label: t("won"),
      value: s.won,
      icon: Trophy,
      colorClass: "text-green-600 dark:text-green-400",
    },
    {
      key: "lost",
      label: t("lost"),
      value: s.lost,
      icon: TrendingDown,
      colorClass: s.lost > 0 ? "text-red-600 dark:text-red-400" : undefined,
    },
    {
      key: "winRate",
      label: t("winRate"),
      value: s.winRate.toFixed(1),
      suffix: "%",
      icon: Percent,
      colorClass:
        s.winRate >= 40
          ? "text-green-600 dark:text-green-400"
          : s.winRate >= 20
            ? "text-yellow-600 dark:text-yellow-400"
            : "text-red-600 dark:text-red-400",
    },
    {
      key: "totalEstimatedValue",
      label: t("totalEstimatedValue"),
      value: formatCurrency(s.totalEstimatedValue),
      icon: Banknote,
      colorClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "totalWeightedValue",
      label: t("totalWeightedValue"),
      value: formatCurrency(s.totalWeightedValue),
      icon: Target,
      colorClass: "text-violet-600 dark:text-violet-400",
    },
    {
      key: "averageSalesCycle",
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
  const tiles = buildTiles(stats, t);

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
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
