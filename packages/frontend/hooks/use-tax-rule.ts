import { clientTaxRuleService } from "@/services/client/tax-rule-client";
import { taxRuleKeys } from "@/types/tax-types";
import { TaxRuleQueryInput } from "@mini-erp/shared";
import { useQuery } from "@tanstack/react-query";

// ============================================================================
// HOOK: useTaxRules (List with filter)
// ============================================================================
export function useTaxRules(initialParams?: TaxRuleQueryInput) {
  const params =
    initialParams ||
    ({
      page: 1,
      limit: 20,
      sortBy: "displayOrder",
      sortOrder: "asc",
    } satisfies TaxRuleQueryInput);

  return useQuery({
    queryKey: taxRuleKeys.list(params),
    queryFn: () => clientTaxRuleService.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// HOOK: useTaxRule (single TaxRule)
// ============================================================================
export function useTaxRule(id: number) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: taxRuleKeys.detail(id),
    queryFn: () => clientTaxRuleService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    taxRule: response?.data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
  };
}
