"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function SalesChart() {
  // Mock data - Replace with real chart library (recharts, chart.js)
  const data = [
    { date: "01/12", value: 4200 },
    { date: "02/12", value: 5100 },
    { date: "03/12", value: 4800 },
    { date: "04/12", value: 6200 },
    { date: "05/12", value: 5800 },
    { date: "06/12", value: 7100 },
    { date: "07/12", value: 6500 },
  ];

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-4">
      {/* Chart Area */}
      <div className="flex h-[300px] items-end justify-between gap-2">
        {data.map((item, index) => (
          <div key={item.date} className="flex flex-1 flex-col items-center gap-2 group">
            <div className="relative w-full">
              {/* Bar */}
              <div
                className="w-full rounded-t bg-primary transition-all hover:opacity-80 cursor-pointer"
                style={{
                  height: `${(item.value / maxValue) * 250}px`,
                  minHeight: "20px",
                }}
              />
              {/* Tooltip on hover */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                €{item.value.toLocaleString()}
              </div>
            </div>
            {/* Date Label */}
            <span className="text-xs text-muted-foreground">{item.date}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span>Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3 w-3" />
          <span>+12.5% vs periodo precedente</span>
        </div>
      </div>
    </div>
  );
}