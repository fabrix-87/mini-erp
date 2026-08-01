import { Decimal } from "@mini-erp/shared";

/**
 * Supported input type for decimal-like UI formatting.
 */
export type DecimalLike = Decimal | string | number | null | undefined;

/**
 * Formats a decimal-like value into a UI-safe string.
 * Useful for Prisma Decimal fields passed to Next.js components.
 *
 * @param value - Decimal-like value to format.
 * @param scale - Number of decimal digits to keep.
 * @returns Formatted decimal string, or empty string when value is nullish.
 */
export function formatDecimal(value: DecimalLike, scale = 2): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return value.toFixed(scale);
  }

  return value.toFixed(scale);
}
