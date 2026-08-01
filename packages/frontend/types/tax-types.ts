import { ApiResponse, PaginatedResponse, TaxRule } from '@mini-erp/shared';

export type {
    TaxRule,
    TaxRuleTranslation
} from '@mini-erp/shared/types'

// ============================================================================
// Cache Tags
// ============================================================================

export const TAX_TAGS = {
  list: "taxes-list",
  detail: (id: number) => `tax-detail-${id}`,
};

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type TaxListApiResponse = PaginatedResponse<TaxRule>;
export interface TaxDetailsApiResponse extends ApiResponse<TaxRule> {}