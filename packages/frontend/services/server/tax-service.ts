import { serverApi } from "@/lib/server/api";
import { TAX_TAGS, TaxListApiResponse } from "@/types/tax-types";
import { TaxRuleQueryInput } from "@mini-erp/shared";

/**
 * Get all taxRules with filters and pagination
 * @param params - Query parameters including pagination (page, limit) and filters
 * @param revalidate - Cache revalidation time in seconds, or false to disable
 * @returns {Promise<TaxListApiResponse>}
 */
export async function getAllTaxRules(
  params?: TaxRuleQueryInput,
  revalidate: number | false = false,
): Promise<TaxListApiResponse> {
  return serverApi.get<TaxListApiResponse>("/tax/rules", {
    params,
    revalidate,
    tags: [TAX_TAGS.list],
    unwrapData: false,
  });
}
