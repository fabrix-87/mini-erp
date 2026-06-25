import { serverApi } from "@/lib/server/api";
import { CurrencyListApiResponse, CurrencySingleApiResponse } from "@/types/currency-types";
import { CurrencyQueryInput } from "@mini-erp/shared";

// ============================================================================
// Cache Tags
// ============================================================================

const CURRENCY_TAGS = {
  list: "currencies-list",
  detail: (code: string) => `currency-${code}`,
};

/**
 * Get all currencies with filters and pagination
 * @param params - Query parameters including pagination (page, limit) and filters
 * @param revalidate - Cache revalidation time in seconds, or false to disable
 * @returns {Promise<CurrencyListApiResponse>}
 */
export async function getAllCurrencies(
  params?: CurrencyQueryInput,
  revalidate: number | false = false,
): Promise<CurrencyListApiResponse> {
  const { page = 1, limit = 20, sortBy = "priority", sortOrder = "asc", ...filters } = params || {};

  return serverApi.get<CurrencyListApiResponse>("/currencies", {
    params: { page, limit, sortBy, sortOrder, ...filters }, // ← includi page e limit
    revalidate,
    tags: [CURRENCY_TAGS.list],
    unwrapData: false,
  });
}


