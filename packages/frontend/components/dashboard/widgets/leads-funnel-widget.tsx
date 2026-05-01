// packages/frontend/components/dashboard/widgets/leads-funnel-widget.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { WidgetWrapper } from "../widget-wrapper";
import type { LeadsFunnelItem } from "@mini-erp/shared";

interface Props {
  data?: LeadsFunnelItem[];
  isLoading: boolean;
  isEditMode: boolean;
}

const STAGE_LABELS: Record<string, string> = {
  NEW: "Nuovi",
  CONTACTED: "Contattati",
  QUALIFIED: "Qualificati",
  CONVERTED: "Convertiti",
};

const COLORS = ["#94a3b8", "#60a5fa", "#34d399", "#10b981"];

/** Leads funnel horizontal bar chart. */
export function LeadsFunnelWidget({ data, isLoading, isEditMode }: Props) {
  const chartData =
    data?.map((d) => ({
      name: STAGE_LABELS[d.stage] ?? d.stage,
      count: d.count,
      pct: parseFloat(d.percentage),
    })) ?? [];

  const isEmpty = chartData.every((d) => d.count === 0);

  return (
    <WidgetWrapper
      title="Funnel Lead"
      isLoading={isLoading}
      isEditMode={isEditMode}
      skeletonRows={4}
    >
      {isEmpty ? (
        <p className="text-xs text-muted-foreground text-center py-6">Nessun dato disponibile</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [value, "Lead"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
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
