import { useQuery } from "@tanstack/react-query";
import { getCurrencyByCode } from "@/services/client/currency";
import { currencyKeys } from "@/types/currency-types";

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Fetches a single currency by its ISO 4217 code.
 * Query is disabled until a non-empty code is provided.
 *
 * @param code    - ISO 4217 alphabetic code (e.g. "EUR", "USD").
 * @param enabled - Additional guard to disable the query from the call site.
 */
export function useCurrency(code: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: currencyKeys.detail(code ?? ""),
    queryFn: () => getCurrencyByCode(code!),
    enabled: enabled && !!code,
    select: (res) => res.data,   // ← unwrap ApiResponse<Currency> → Currency
  });
}