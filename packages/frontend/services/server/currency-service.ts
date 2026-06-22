import { serverApi } from "@/lib/server/api";
import { CurrencyListApiResponse } from "@/types/currency-types";
import { CurrencyQueryInput } from "@mini-erp/shared";

// ============================================================================
// Cache Tags
// ============================================================================

const CURRENCY_TAGS = {
  list: "currencies-list",
  detail: (id: number) => `currency-${id}`,
};

/**
 * Get all currencies with filters and pagination
 * Con cache per performance
 * @return {Promise<CurrencyListApiResponse>}
 */
export async function getAllCurrencies(
  params?: CurrencyQueryInput,
  revalidate: number | false = 300,
): Promise<CurrencyListApiResponse> {
  const { page = 1, limit = 20, ...queryParams } = params || {};

  return serverApi.get<CurrencyListApiResponse>("/currencies", {
    params: queryParams,
    revalidate,
    tags: [CURRENCY_TAGS.list],
    unwrapData: false,
  });
}
