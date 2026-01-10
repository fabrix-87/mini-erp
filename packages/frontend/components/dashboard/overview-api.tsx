"use client";

import { useQuery } from "@tanstack/react-query";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { getDashboardOverview } from "@/lib/client/modules/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DashboardPageProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function DashboardOverviewWithAPI({ dateRange }: DashboardPageProps) {
  // Fetch overview data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-overview", dateRange],
    queryFn: async () => {
      const response = await getDashboardOverview({
        startDate: dateRange.from,
        endDate: dateRange.to,
      });
      return response;
    },
    // Refetch every 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* KPI Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-6 space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-8 w-[100px]" />
              <Skeleton className="h-3 w-[140px]" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <Skeleton className="h-6 w-[200px] mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <Skeleton className="h-6 w-[200px] mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Errore nel caricamento dei dati</AlertTitle>
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : "Impossibile caricare i dati della dashboard. Riprova più tardi."}
        </AlertDescription>
      </Alert>
    );
  }

  // Success state with data
  return <OverviewTab dateRange={dateRange} data={data?.data} />;
}
