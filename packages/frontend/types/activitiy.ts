// types/activity.ts
export type {
  ActivityStatsInput,
  ActivityPriority,
  ActivityOutcome,
  Activity,
  ActivityQueryInput,
  ActivityFormData,
} from "@mini-erp/shared/types";

export interface ActivityDashboardStats {
  planned: number;
  completed: number;
  overdue: number;
  todayCount: number;
  upcomingWeek: number;
  completionRate: number;
}

export interface ActivityStats {
  byType: Array<{ type: string; _count: number }>;
  byStatus: Array<{ status: string; _count: number }>;
  byPriority: Array<{ priority: string; _count: number }>;
  byOutcome: Array<{ outcome: string; _count: number }>;
  overdue: number;
  today: number;
  followUp: number;
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
