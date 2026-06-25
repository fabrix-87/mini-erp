import { ApiResponse, Currency, CurrencySortField, PaginatedResponse } from "@mini-erp/shared";

export const currencySortLabels: Record<CurrencySortField, string> = {
  createdAt: "Data Creazione",
  updatedAt: "Ultimo Aggiornamento",
  numericCode: "Codice Numerico",
  code: "Codice Valuta",
  symbol: "Simbolo",
  isBaseCurrency: "Valuta Base",
  priority: "Priorità",
};

// ============================================================================
// QUERY KEYS
// ============================================================================

export const currencyKeys = {
  all: ["currencies"] as const,
  lists: () => [...currencyKeys.all, "list"] as const,
  list: (params: object) => [...currencyKeys.lists(), params] as const,
  detail: (code: string) => [...currencyKeys.all, "detail", code] as const,
};

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type CurrencyListApiResponse = PaginatedResponse<Currency>;
export interface CurrencySingleApiResponse extends ApiResponse<Currency> {}
