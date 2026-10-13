import { buildQueryString } from "@/helpers/role-helper";
import api from "@/lib/client/api";
import { TaxListApiResponse, TaxSingleApiResponse } from "@/types/tax-types";
import { TaxRuleQueryInput } from "@mini-erp/shared";

// ============================================================================
// CLIENT TAX RULE SERVICES (Browser only - React Query)
// ============================================================================

export const clientTaxRuleService = {
  async getAll(params: TaxRuleQueryInput): Promise<TaxListApiResponse> {
    const queryString = buildQueryString(params);
    const url = queryString ? `/tax/rules?${queryString}` : "/tax/rules";
    const { data } = await api.get<TaxListApiResponse>(url);
    return data;
  },
  async getById(id: number): Promise<TaxSingleApiResponse> {
    const { data } = await api.get<TaxSingleApiResponse>(`/tax/rules?${id}`);
    return data;
  },
};
