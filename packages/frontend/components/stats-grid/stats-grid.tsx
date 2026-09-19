import { cn } from "@/lib/utils";
import { StatCard } from "./stat-card";
import { StatsGridColumns, type StatsGridProps } from "@/types/stats-grid-types";

const GRID_COLUMNS_CLASS: Record<StatsGridColumns, string> = {
  [StatsGridColumns.Four]: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
  [StatsGridColumns.Six]: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6",
  [StatsGridColumns.Eight]: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
  [StatsGridColumns.Twelve]: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
};

/**
 * Renders a responsive, accessible grid of compact KPI cards.
 *
 * @param props - Translated metrics and responsive grid configuration.
 * @returns Responsive KPI grid.
 */
export function StatsGrid({
  metrics,
  ariaLabel,
  columns = StatsGridColumns.Twelve,
  className,
}: StatsGridProps): React.JSX.Element {
  return (
    <section
      aria-label={ariaLabel}
      className={cn(
        "grid gap-3",
        GRID_COLUMNS_CLASS[columns],
        className,
      )}
    >
      {metrics.map((metric) => (
        <StatCard key={metric.id} metric={metric} />
      ))}
    </section>
  );
}
