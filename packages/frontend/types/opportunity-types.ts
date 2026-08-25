// types/opportunity-types.ts
import type {
  Opportunity,
  OpportunityListItem,
  OpportunityStats,
  OpportunityQueryInput,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  OpportunityComplete,
  PaginatedResponse,
  ApiResponse,
} from "@mini-erp/shared";

export type {
  Opportunity,
  OpportunityListItem,
  OpportunityStats,
  OpportunityQueryInput,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  OpportunityComplete,
};

export type OpportunityListApiResponse = PaginatedResponse<OpportunityListItem>;
export type OpportunityStatsApiResponse = ApiResponse<OpportunityStats>;
export type OpportunityOperationApiResponse = ApiResponse<{ success: boolean }>;

export const OPPORTUNITY_TAGS = {
  list: "opportunities-list",
  detail: (id: string): string => `opportunity-${id}`,
  stats: "opportunities-stats",
} as const;
