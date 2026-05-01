import {
  DashboardPeriod,
  DashboardScope,
} from "@mini-erp/shared";

export type { DashboardApiResponse } from "@mini-erp/shared"

export type PeriodStats = [
  "today",
  "yesterday",
  "last7days",
  "last30days",
  "last90days",
  "thisWeek",
  "lastWeek",
  "thisMonth",
  "lastMonth",
  "thisQuarter",
  "lastQuarter",
  "thisYear",
  "lastYear",
  "custom",
];

export interface DashboardQueryParams {
  period?: DashboardPeriod;
  scope?: DashboardScope;
  targetUserId?: number;
  customFrom?: string;
  customTo?: string;
  feedLimit?: number;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const dashboardKeys = {
  all: ["dashboard"] as const,
  data: (params: DashboardQueryParams) => [...dashboardKeys.all, "data", params] as const,
};
