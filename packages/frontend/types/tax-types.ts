import { ApiResponse, PaginatedResponse, TaxRule, TaxRuleQueryInput } from "@mini-erp/shared";

export type { TaxRule, TaxRuleTranslation } from "@mini-erp/shared/types";

// ============================================================================
// Cache Tags
// ============================================================================

export const TAX_TAGS = {
  list: "taxes-list",
  detail: (id: number) => `tax-detail-${id}`,
};

export const taxRuleKeys = {
  all: ["tax-rules"] as const,
  lists: () => [...taxRuleKeys.all, "list"] as const,
  list: (params: TaxRuleQueryInput) => [...taxRuleKeys.lists(), params] as const,
  details: () => [...taxRuleKeys.all, "detail"] as const,
  detail: (id: number) => [...taxRuleKeys.details(), id] as const,
};

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type TaxListApiResponse = PaginatedResponse<TaxRule>;
export type TaxSingleApiResponse = ApiResponse<TaxRule>;
export interface TaxDetailsApiResponse extends ApiResponse<TaxRule> {}
