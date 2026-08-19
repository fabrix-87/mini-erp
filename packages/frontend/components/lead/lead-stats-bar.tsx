// components/leads/lead-stats-bar.tsx
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadStats } from "@mini-erp/shared";
import { formatCurrency } from "@/utils/format-currency";

// ============================================================================
// Props
// ============================================================================

interface LeadStatsBarProps {
  stats: LeadStats | undefined;
  isLoading: boolean;
}

// ============================================================================
// Tile config
// ============================================================================

interface StatTile {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ElementType;
  /** Optional highlight color class for the value */
  colorClass?: string;
}

function buildTiles(s: LeadStats): StatTile[] {
  return [
    {
      label: "Totale lead",
      value: s.total,
      icon: Users,
    },
    {
      label: "Nuove questo mese",
      value: s.newThisMonth,
      icon: TrendingUp,
      colorClass: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Nuove questa settimana",
      value: s.newThisWeek,
      icon: CalendarClock,
    },
    {
      label: "Convertite",
      value: s.converted,
      icon: CheckCircle2,
      colorClass: "text-green-600 dark:text-green-400",
    },
    {
      label: "Tasso conversione",
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
      label: "Perse",
      value: s.lost,
      icon: TrendingDown,
      colorClass: s.lost > 0 ? "text-red-600 dark:text-red-400" : undefined,
    },
    {
      label: "Score medio",
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
      label: "Tempo medio conversione",
      value: s.averageConversionTime,
      suffix: " gg",
      icon: Clock,
    },
    {
      label: "Valore stimato pipeline",
      value: formatCurrency(s.totalEstimatedValue),
      icon: Banknote,
      colorClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Qualificate (BANT)",
      value: s.qualifiedLeads,
      icon: Target,
    },
    {
      label: "Follow-up pianificati",
      value: s.needFollowUp,
      icon: CalendarClock,
    },
    {
      label: "Follow-up scaduti",
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
export function LeadStatsBar({ stats, isLoading }: LeadStatsBarProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const tiles = buildTiles(stats);

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {tiles.map(({ label, value, suffix, icon: Icon, colorClass }) => (
        <Card key={label} className="overflow-hidden">
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
