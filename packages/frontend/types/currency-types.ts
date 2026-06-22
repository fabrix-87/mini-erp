import { ApiResponse, Currency, PaginatedResponse } from "@mini-erp/shared";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const currencyKeys = {
  all: ["currencies"] as const,
  lists: () => [...currencyKeys.all, "list"] as const,
  list: (params: object) => [...currencyKeys.lists(), params] as const,
  detail: (id: number) => [...currencyKeys.all, "detail", id] as const,
};

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type CurrencyListApiResponse = PaginatedResponse<Currency>;
export interface CurrencySingleApiResponse extends ApiResponse<Currency> {}
