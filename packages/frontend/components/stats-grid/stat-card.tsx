import { cn } from "@/lib/utils";
import type { StatMetric, StatTone } from "@/types/stats-grid-types";

interface StatCardProps {
  metric: StatMetric;
}

const TONE_VALUE_CLASS: Record<StatTone, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-error",
};

const TONE_ICON_CLASS: Record<StatTone, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-lightprimary text-primary",
  success: "bg-lightsuccess text-success",
  warning: "bg-lightwarning text-warning",
  danger: "bg-lighterror text-error",
};

/**
 * Renders one compact statistic card with either a single KPI value or a
 * structured breakdown of related values.
 *
 * @param props - Metric configuration used to render the statistic card.
 * @returns Statistic card with an accessible KPI body.
 */
export function StatCard({ metric }: StatCardProps): React.JSX.Element {
  const Icon = metric.icon;
  const tone = metric.tone ?? "default";

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-card p-4 shadow-sm",
        metric.kind === "value" && "flex min-h-28 flex-col justify-between",
        metric.kind === "breakdown" && "min-h-28",
        metric.priority === "primary" && "ring-1 ring-primary/5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm leading-5 text-muted-foreground">{metric.label}</p>

        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            TONE_ICON_CLASS[tone],
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>

      {metric.kind === "value" ? (
        <p
          className={cn(
            "mt-3 text-3xl font-semibold tracking-tight tabular-nums",
            TONE_VALUE_CLASS[tone],
          )}
        >
          {metric.value}

          {metric.suffix && (
            <span className="ml-0.5 text-sm font-normal text-muted-foreground">
              {metric.suffix}
            </span>
          )}
        </p>
      ) : (
        <div className="mt-3 space-y-1.5">
          {metric.rows.length > 0 ? (
            metric.rows.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-muted-foreground">{row.label}</span>

                <span className="shrink-0 font-medium tabular-nums text-foreground">
                  {row.value}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{metric.emptyLabel}</p>
          )}
        </div>
      )}
    </article>
  );
}
