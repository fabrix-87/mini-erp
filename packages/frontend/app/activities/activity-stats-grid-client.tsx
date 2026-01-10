// app/activities/activity-stats-grid-client.tsx
"use client";

import { useActivityStats } from "@/hooks/use-activity";
import { ActivityStatsGrid } from "@/components/activity/activity-stats-grid";

export function ActivityStatsGridClient() {
  const { data: statsData, isLoading } = useActivityStats();

  return <ActivityStatsGrid stats={statsData?.data} isLoading={isLoading} />;
}
