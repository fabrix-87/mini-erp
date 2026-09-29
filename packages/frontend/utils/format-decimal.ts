import { Decimal } from "@mini-erp/shared";

/**
 * Supported input type for decimal-like UI formatting.
 */
export type DecimalLike = Decimal | string | number | null | undefined;

/**
 * Converts a Decimal, number, or string value into a clean string suitable
 * for controlled form inputs (text/number).
 *
 * @param value The input value to convert (Decimal, number, string, null, or undefined)
 * @param scale Optional number of decimal places to format the output to
 * @param defaultValue Fallback string if the value is null or undefined (defaults to "")
 * @returns Formatted string ready for input value binding
 */
export function formatDecimalForInput(
  value: DecimalLike,
  scale?: number,
  defaultValue: string = "",
): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  let numValue: Decimal | number | null = null;

  // Extract numeric or Decimal instance
  if (Decimal.isDecimal(value)) {
    numValue = value;
  } else if (typeof value === "number") {
    if (Number.isNaN(value)) return defaultValue;
    numValue = value;
  } else if (typeof value === "string") {
    const normalized = value.trim().replace(",", ".");
    if (normalized === "" || Number.isNaN(Number(normalized))) {
      return defaultValue;
    }
    // Convert valid numeric string into Decimal to preserve precision
    numValue = new Decimal(normalized);
  } else if (typeof value === "object" && "toString" in value) {
    numValue = new Decimal((value as { toString(): string }).toString());
  }

  if (numValue === null) {
    return defaultValue;
  }

  // Format with specified scale if provided
  if (scale !== undefined) {
    if (Decimal.isDecimal(numValue)) {
      return numValue.toFixed(scale);
    }
    return (numValue as number).toFixed(scale);
  }

  return numValue.toString();
}
