import { Decimal } from "@mini-erp/shared";
import { formatDecimal } from "./format-decimal";

/**
 * Formats a tax rate value for display.
 *
 * Example:
 * - 22      -> "22.00%"
 * - 4.1     -> "4.10%"
 * - null    -> "—"
 *
 * @param rate - Tax rate decimal value.
 * @returns Formatted tax rate label.
 */
export function formatTaxRate(rate: Decimal | string | number | null | undefined): string {
  if (rate === null || rate === undefined) {
    return "—";
  }

  return `${formatDecimal(rate, 2)}%`;
}
