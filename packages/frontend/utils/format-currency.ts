import { Currency } from "@mini-erp/shared";
import { DecimalLike } from "./format-decimal";

/**
 * Accepted currency input: a full Currency entity, an ISO 4217 code string,
 * or omitted/null (falls back to "EUR").
 */
export type CurrencyInput = Currency | string | null | undefined;

/**
 * Resolves a CurrencyInput to its ISO 4217 code string.
 * Falls back to "EUR" when input is nullish.
 *
 * @param currency - A Currency entity, an ISO code string, or nullish.
 * @returns The resolved ISO 4217 currency code.
 */
function resolveCurrencyCode(currency: CurrencyInput): string {
  if (!currency) return "EUR";
  if (typeof currency === "string") return currency;
  return currency.code;
}

/**
 * Resolves the number of fraction digits from a CurrencyInput.
 * Uses `minorUnit` from a Currency entity when available,
 * falls back to the provided default (typically 2 for most currencies).
 *
 * @param currency       - A Currency entity, an ISO code string, or nullish.
 * @param fallbackDigits - Fallback value when minorUnit is not determinable. Defaults to 2.
 * @returns The number of fraction digits to use.
 */
function resolveFractionDigits(currency: CurrencyInput, fallbackDigits = 2): number {
  if (currency && typeof currency === "object" && "minorUnit" in currency) {
    return currency.minorUnit;
  }
  return fallbackDigits;
}

/**
 * Options for `formatCurrency`.
 */
export interface FormatCurrencyOptions {
  /**
   * BCP 47 locale string for number formatting.
   * @default "it-IT"
   */
  locale?: string;
  /**
   * Override minimum fraction digits. When omitted, uses `currency.minorUnit`
   * for Currency entities, or 2 for plain ISO code strings.
   */
  minimumFractionDigits?: number;
  /**
   * Override maximum fraction digits. When omitted, uses `currency.minorUnit`
   * for Currency entities, or 2 for plain ISO code strings.
   */
  maximumFractionDigits?: number;
}

/**
 * Formats a decimal-like value as a localized currency string.
 * Accepts either a full Currency entity or a plain ISO 4217 code string.
 *
 * - Falls back to "EUR" when no currency is provided.
 * - Uses `currency.minorUnit` as fraction digits when a Currency entity is passed.
 * - Locale defaults to "it-IT"; pass `options.locale` to override.
 *
 * @param value    - The numeric/decimal value to format.
 * @param currency - A Currency entity, an ISO code (e.g. "USD"), or omitted for EUR.
 * @param options  - Optional locale and fraction digit overrides.
 * @returns Formatted currency string, or "—" when value is nullish or NaN.
 *
 * @example
 * formatCurrency(1234.5)                              // "1.235 €"   (it-IT, EUR, minorUnit 2 → 0 decimals via fractionDigits default)
 * formatCurrency(1234.5, "USD")                       // "1.235 US$" (it-IT, USD, fallback 2 digits)
 * formatCurrency(1234.5, currencyEntity)              // usa currencyEntity.code + currencyEntity.minorUnit
 * formatCurrency(1234.5, currencyEntity, { locale: "en-US" })  // en-US locale
 * formatCurrency(1234.5, null)                        // fallback "EUR"
 * formatCurrency(null)                                // "—"
 */
export function formatCurrency(
  value: DecimalLike,
  currency?: CurrencyInput,
  options: FormatCurrencyOptions = {},
): string {
  const numericValue = Number(value);

  if (value == null || isNaN(numericValue)) return "—";

  const { locale = "it-IT", minimumFractionDigits, maximumFractionDigits } = options;

  const code = resolveCurrencyCode(currency);
  const fractionDigits = resolveFractionDigits(currency);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: minimumFractionDigits ?? fractionDigits,
    maximumFractionDigits: maximumFractionDigits ?? fractionDigits,
  }).format(numericValue);
}
