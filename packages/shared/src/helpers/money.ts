import Decimal from "decimal.js";
import { MONEY_PRECISION } from "../constants";

/**
 * Rounds a given price or currency value to the standard money precision
 * using half-up rounding.
 *
 * @param {import("decimal.js").Decimal.Value} price - The numerical or Decimal value to round.
 * @returns {Decimal} A new Decimal instance rounded to the specified currency precision.
 * 
 * @example
 * const rounded = roundCurrency(10.567); // Returns Decimal(10.57)
 */
export function roundCurrency(price: Decimal.Value): Decimal {
  const value = new Decimal(price);
  return value.toDecimalPlaces(MONEY_PRECISION, Decimal.ROUND_HALF_UP);
}
