import { ApiResponse, Lead, LeadStats, PaginatedResponse } from "@mini-erp/shared";
import { LeadStatsInput } from "./lead-types";
import { LeadQueryInput } from "./lead-types";

export type {
  Lead,
  LeadStats,
  CreateLeadInput,
  UpdateLeadInput,
  UpdateLeadStatusInput,
  UpdateLeadScoreInput,
  QualifyLeadInput,
  ConvertLeadInput,
  BulkAssignLeadsInput,
  BulkUpdateLeadStatusInput,
  LeadQueryInput,
  LeadStatsInput,
  LeadIdParam,
} from "@mini-erp/shared/types";

// ============================================================================
// Query Keys
// ============================================================================

export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (params: LeadQueryInput) => [...leadKeys.lists(), params] as const,
  details: () => [...leadKeys.all, "detail"] as const,
  detail: (id: number) => [...leadKeys.details(), id] as const,
  stats: (params?: LeadStatsInput) => [...leadKeys.all, "stats", params] as const,
};

// ============================================================================
// Server Cache Tags
// ============================================================================

export const LEAD_TAGS = {
  list: "leads-list",
  detail: (id: string) => `lead-${id}`,
};

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type LeadListApiResponse = PaginatedResponse<Lead>;
export interface LeadSingleApiResponse extends ApiResponse<Lead> {}
export interface LeadStatsApiResponse extends ApiResponse<LeadStats> {}
