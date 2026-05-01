// packages/frontend/components/dashboard/kpi-stat.tsx
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiStatProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  /** Percentage change vs previous period (positive = up, negative = down) */
  growthRate?: string;
  colorClass?: string;
  description?: string;
}

/**
 * Single KPI metric cell with optional growth rate indicator.
 * Used inside all *-kpi-widget components.
 */
export function KpiStat({
  label,
  value,
  icon: Icon,
  growthRate,
  colorClass,
  description,
}: KpiStatProps) {
  const rate = growthRate !== undefined ? parseFloat(growthRate) : null;
  const TrendIcon = rate === null ? null : rate > 0 ? TrendingUp : rate < 0 ? TrendingDown : Minus;
  const trendColor =
    rate === null
      ? ""
      : rate > 0
        ? "text-green-600 dark:text-green-400"
        : rate < 0
          ? "text-red-500 dark:text-red-400"
          : "text-muted-foreground";

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {Icon && (
          <Icon className={cn("h-3.5 w-3.5 shrink-0", colorClass ?? "text-muted-foreground")} />
        )}
      </div>

      <span className={cn("text-xl font-bold tabular-nums leading-none", colorClass)}>{value}</span>

      {TrendIcon && rate !== null && (
        <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
          <TrendIcon className="h-3 w-3" />
          <span>
            {rate > 0 ? "+" : ""}
            {rate.toFixed(1)}%
          </span>
        </div>
      )}

      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
  );
}
