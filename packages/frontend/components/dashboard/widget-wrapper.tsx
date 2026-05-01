// packages/frontend/components/dashboard/widget-wrapper.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetWrapperProps {
  title: string;
  isLoading?: boolean;
  isError?: boolean;
  isEditMode?: boolean;
  className?: string;
  skeletonRows?: number;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Generic wrapper for all dashboard widgets.
 * Handles loading skeleton, error state, and drag-mode affordance.
 */
export function WidgetWrapper({
  title,
  isLoading = false,
  isError = false,
  isEditMode = false,
  className,
  skeletonRows = 3,
  headerExtra,
  children,
}: WidgetWrapperProps) {
  return (
    <Card
      className={cn(
        "h-full flex flex-col overflow-hidden transition-all duration-150",
        isEditMode && "ring-2 ring-primary/40 shadow-md cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 shrink-0">
        <div className="flex items-center gap-1.5">
          {isEditMode && <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />}
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </div>
        {headerExtra}
      </CardHeader>

      <CardContent className="flex-1 min-h-0 pt-0">
        {isError ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-6 text-muted-foreground">
            <AlertCircle className="h-7 w-7 text-destructive/60" />
            <p className="text-xs">Impossibile caricare i dati</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-2 pt-1">
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn("h-4", i === skeletonRows - 1 ? "w-3/4" : "w-full")}
              />
            ))}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
