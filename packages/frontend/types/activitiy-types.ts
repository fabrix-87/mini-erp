// types/activity.ts

import {
  Activity,
  ApiResponse,
} from "@mini-erp/shared";

export type {
  ActivityStatsInput,
  ActivityPriority,
  ActivityOutcome,
  Activity,
  ActivityQueryInput,
} from "@mini-erp/shared/types";

export interface ActivityDashboardStats {
  planned: number;
  completed: number;
  overdue: number;
  todayCount: number;
  upcomingWeek: number;
  completionRate: number;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const activityKeys = {
  all: ["activity"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (params: object) => [...activityKeys.lists(), params] as const,
  detail: (id: number) => [...activityKeys.all, "detail", id] as const,
  stats: () => [...activityKeys.all, "stats"] as const,
};

export const ACTIVITY_TAGS = {
  list: "activities-list",
  detail: (id: string): string => `activity-${id}`,
  stats: "activities-stats",
} as const;

export type ActivitySingleApiResponse = ApiResponse<Activity>;
