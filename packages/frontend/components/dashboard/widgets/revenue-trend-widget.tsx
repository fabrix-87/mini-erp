// packages/frontend/components/dashboard/widgets/revenue-trend-widget.tsx
"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { WidgetWrapper } from "../widget-wrapper";
import type { RevenueTrendPoint } from "@mini-erp/shared";

interface Props {
  data?: RevenueTrendPoint[];
  isLoading: boolean;
  isEditMode: boolean;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);

/** Revenue trend area chart: fatturato vs incassato per periodo. */
export function RevenueTrendWidget({ data, isLoading, isEditMode }: Props) {
  const chartData =
    data?.map((d) => ({
      label: d.label,
      Fatturato: parseFloat(d.invoicedAmount),
      Incassato: parseFloat(d.collectedAmount),
    })) ?? [];

  const isEmpty = chartData.length === 0;

  return (
    <WidgetWrapper
      title="Andamento Ricavi"
      isLoading={isLoading}
      isEditMode={isEditMode}
      skeletonRows={5}
    >
      {isEmpty ? (
        <p className="text-xs text-muted-foreground text-center py-6">Nessun dato disponibile</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradFatturato" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradIncassato" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => fmt(v)}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="Fatturato"
              stroke="#60a5fa"
              fill="url(#gradFatturato)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="Incassato"
              stroke="#34d399"
              fill="url(#gradIncassato)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </WidgetWrapper>
  );
}
