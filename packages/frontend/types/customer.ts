export type { Customer, CustomerStats } from "@mini-erp/shared/types";

export type {
  CustomerType,
  CustomerPriority,
  CustomerSegment,
  LeadStatus,
  CreditCheckStatus,
  CustomerSize,
} from "@mini-erp/shared/constants";

import { CustomerQueryInput as BaseQuery  } from "@mini-erp/shared/types";

export type CustomerQueryInput = Omit<
  BaseQuery,
  "leadStatus" | "type" | "segment"
> & {
  // Ridefinisco ogni campo recuperando il tipo originale e aggiungendo "all"
  type?: BaseQuery["type"] | "all";
  segment?: BaseQuery["segment"] | "all";
};

// ============================================================================
// QUERY KEYS
// ============================================================================

export const customerKeys = {
  all: ["customer"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params: object) => [...customerKeys.lists(), params] as const,
  detail: (id: number) => [...customerKeys.all, "detail", id] as const,
  stats: () => [...customerKeys.all, "stats"] as const,
};