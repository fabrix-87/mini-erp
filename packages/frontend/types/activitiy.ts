// types/activity.ts
export type { 
  ActivityStatsInput,
  ActivityType,
  ActivityStatus,
  ActivityPriority,
  ActivityOutcome,
  Activity,
  ActivityQueryInput,
 } from '@mini-erp/shared/types'

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
