// packages/frontend/components/dashboard/widgets/opportunities-pipeline-widget.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { WidgetWrapper } from "../widget-wrapper";
import type { OpportunitiesPipelineItem } from "@mini-erp/shared";

interface Props {
  data?: OpportunitiesPipelineItem[];
  isLoading: boolean;
  isEditMode: boolean;
}

const STAGE_LABELS: Record<string, string> = {
  PROSPECTING: "Prospecting",
  QUALIFICATION: "Qualifica",
  PROPOSAL: "Proposta",
  NEGOTIATION: "Negoziazione",
  CLOSED_WON: "Chiusa Vinta",
  CLOSED_LOST: "Chiusa Persa",
};

const COLORS = ["#94a3b8", "#60a5fa", "#a78bfa", "#f59e0b", "#34d399", "#f87171"];

const fmt = (v: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);

/** Opportunities pipeline bar chart: count per stage. */
export function OpportunitiesPipelineWidget({ data, isLoading, isEditMode }: Props) {
  const chartData =
    data?.map((d) => ({
      name: STAGE_LABELS[d.stage] ?? d.stage,
      count: d.count,
      value: parseFloat(d.totalValue),
    })) ?? [];

  const isEmpty = chartData.every((d) => d.count === 0) || chartData.length === 0;

  return (
    <WidgetWrapper
      title="Pipeline Opportunità"
      isLoading={isLoading}
      isEditMode={isEditMode}
      skeletonRows={4}
    >
      {isEmpty ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Nessuna opportunità nel periodo
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              angle={-20}
              textAnchor="end"
            />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v: number, name: string) =>
                name === "value" ? [fmt(v), "Valore"] : [v, "Numero"]
              }
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </WidgetWrapper>
  );
}
