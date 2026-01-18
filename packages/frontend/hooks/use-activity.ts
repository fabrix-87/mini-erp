// hooks/use-activity.ts
import { useQuery } from "@tanstack/react-query";
import {
  getActivityStats,
  getActivities,
  getActivityById,  
} from "@/services/client/activity";
import { ActivityStatsInput, ActivityQueryInput } from "@/types/activitiy";

/**
 * Hook per le statistiche delle attività
 */
export function useActivityStats(params?: ActivityStatsInput) {
  return useQuery({
    queryKey: ["activity-stats", params],
    queryFn: () => getActivityStats(params),
  });
}

/**
 * Hook per la lista delle attività
 */
export function useActivities(params: ActivityQueryInput) {
  return useQuery({
    queryKey: ["activities", params],
    queryFn: () => getActivities(params),
  });
}

/**
 * Hook per una singola attività
 */
export function useActivity(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: ["activity", id],
    queryFn: () => getActivityById(id!),
    enabled: enabled && !!id,
  });
}
