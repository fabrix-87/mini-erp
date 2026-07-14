export type { Customer, CustomerStats } from "@mini-erp/shared/types";

export type {
  CustomerType,
  CustomerPriority,
  CustomerSegment,
  LeadStatus,
  CreditCheckStatus,
  CustomerSize,
} from "@mini-erp/shared/constants";

import { ApiResponse, Customer, PaginatedResponse } from "@mini-erp/shared";
import { CustomerQueryInput as BaseQuery } from "@mini-erp/shared/types";

export type CustomerQueryInput = Omit<BaseQuery, "leadStatus" | "type" | "segment"> & {
  // Ridefinisco ogni campo recuperando il tipo originale e aggiungendo "all"
  type?: BaseQuery["type"] | "all";
  segment?: BaseQuery["segment"] | "all";
};

// ============================================================================
// Client Query Keys
// ============================================================================

export const customerKeys = {
  all: ["customer"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params: object) => [...customerKeys.lists(), params] as const,
  detail: (id: string) => [...customerKeys.all, "detail", id] as const,
  stats: () => [...customerKeys.all, "stats"] as const,
};

// ============================================================================
// Server Cache Tags
// ============================================================================

export const CUSTOMER_TAGS = {
  list: "customer-list",
  detail: (id: string) => `customer-${id}`,
};

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type CustomerListApiResponse = PaginatedResponse<Customer>;
export interface CustomerSingleApiResponse extends ApiResponse<Customer> {}
export interface CustomerDeleteApiResponse extends ApiResponse<null> {}
