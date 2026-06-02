/**
 * Formats a numeric value as a localized currency string.
 *
 * Uses the built-in `Intl.NumberFormat` API to apply locale-aware currency
 * formatting, including grouping separators, decimal separators, currency
 * symbol placement, and rounding rules. When `fractionDigits` is provided,
 * the formatter forces that exact number of decimal places.
 *
 * @param {string | number | null | undefined} value - The value to format. String values are parsed with `Number()`.
 * @param {string} [locale="it-IT"] - The BCP 47 locale used for formatting.
 * @param {string} [currency="EUR"] - The ISO 4217 currency code.
 * @param {number} [fractionDigits] - Optional fixed number of decimal digits to display.
 * @returns {string} The formatted currency string, or "—" when the input is null, undefined, or not numeric.
 *
 * @example
 * formatCurrency(1234.5)
 * // "€ 1.234,50"
 *
 * @example
 * formatCurrency(1234.5, "it-IT", "EUR", 0)
 * // "€ 1.235"
 *
 * @example
 * formatCurrency("99.99", "en-US", "USD", 2)
 * // "$99.99"
 */
export function formatCurrency(
  value: string | number | null | undefined,
  locale: string = "it-IT",
  currency: string = "EUR",
  fractionDigits?: number,
): string {
  if (value == null) return "—";

  const num = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(num)) return "—";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...(typeof fractionDigits === "number"
      ? {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }
      : {}),
  }).format(num);
}
