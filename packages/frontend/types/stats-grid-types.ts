import type { LucideIcon } from "lucide-react";

export type StatTone = "default" | "primary" | "success" | "warning" | "danger";

export type StatPriority = "primary" | "secondary";

/**
 * Defines the expected desktop capacity for the statistics grid.
 *
 * Values express the intended number of KPI cards, not literal grid columns.
 */
export enum StatsGridColumns {
  Four = "four",
  Six = "six",
  Eight = "eight",
  Twelve = "twelve",
}

interface BaseStatMetric {
  id: string;
  label: string;
  icon: LucideIcon;
  tone?: StatTone;
  priority?: StatPriority;
}

export interface ValueStatMetric extends BaseStatMetric {
  kind: "value";
  value: string | number;
  suffix?: string;
}

export interface BreakdownStatRow {
  id: string;
  label: string;
  value: string | number;
}

export interface BreakdownStatMetric extends BaseStatMetric {
  kind: "breakdown";
  rows: readonly BreakdownStatRow[];
  emptyLabel?: string;
}

export type StatMetric = ValueStatMetric | BreakdownStatMetric;

export interface StatsGridProps {
  metrics: readonly StatMetric[];
  ariaLabel: string;
  className?: string;
  columnsClassName?: string;
  columns?: StatsGridColumns;
}
