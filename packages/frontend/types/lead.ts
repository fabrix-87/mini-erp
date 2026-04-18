import { LeadStatsInput } from "./lead";
import { LeadQueryInput } from "./lead";

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