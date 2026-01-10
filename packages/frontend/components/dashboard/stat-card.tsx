"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  growth?: number;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ title, value, growth, icon: Icon, description }: StatCardProps) {
  const isPositive = growth && growth > 0;
  const isNegative = growth && growth < 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {growth !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {isPositive && (
              <>
                <ArrowUpIcon className="h-3 w-3 text-green-500" />
                <span className="text-green-500 font-medium">+{growth.toFixed(1)}%</span>
              </>
            )}
            {isNegative && (
              <>
                <ArrowDownIcon className="h-3 w-3 text-red-500" />
                <span className="text-red-500 font-medium">{growth.toFixed(1)}%</span>
              </>
            )}
            {!isPositive && !isNegative && (
              <span className="text-muted-foreground">0.0%</span>
            )}
            <span className="ml-1">vs periodo precedente</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}