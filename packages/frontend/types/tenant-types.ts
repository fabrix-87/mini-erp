// ============================================================================
// Cache Tags
// ============================================================================

import { ApiResponse, PaginatedResponse, TenantWithDetails } from "@mini-erp/shared";

export const TENANT_TAGS = {
  list: "tenants-list",
  detail: (id: string) => `tenant-detail-${id}`,
};

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type TenantListApiResponse = PaginatedResponse<TenantWithDetails>;
export interface TenantDetailsApiResponse extends ApiResponse<TenantWithDetails> {}