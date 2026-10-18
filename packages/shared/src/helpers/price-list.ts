// packages/shared/src/helpers/price-list-helper.ts
import Decimal from "decimal.js";
import { PRICE_LIST_ROUNDING_METHOD, PRICE_LIST_STRATEGY } from "../constants";
import type { PriceListStrategy, RoundingMethod } from "../constants";

/**
 * Applies a price list strategy to the parent price. The result is not rounded.
 * @param base - Parent list unit price (base UoM)
 * @param strategy - Strategy of the derived list
 * @param value - strategyValue of the derived list
 * @returns Derived price, never negative
 */
export function applyPriceListStrategy(
  base: Decimal.Value,
  strategy: PriceListStrategy,
  value: Decimal.Value,
): Decimal {
  const b = new Decimal(base);
  const v = new Decimal(value);
  switch (strategy) {
    case PRICE_LIST_STRATEGY.PERCENT_DECREASE:
      return b.times(new Decimal(100).minus(v)).div(100);
    case PRICE_LIST_STRATEGY.PERCENT_INCREASE:
      return b.times(new Decimal(100).plus(v)).div(100);
    case PRICE_LIST_STRATEGY.FIXED_DECREASE:
      return Decimal.max(b.minus(v), 0);
    case PRICE_LIST_STRATEGY.FIXED_INCREASE:
      return b.plus(v);
    default:
      return b;
  }
}

/**
 * Rounds a computed price according to the list rounding method (applied once, at the end).
 * @returns Price with 6 decimals
 */
export function roundPrice(price: Decimal.Value, method: RoundingMethod): Decimal {
  const p = new Decimal(price);
  switch (method) {
    case PRICE_LIST_ROUNDING_METHOD.NEAREST_05:
      return p.div("0.05").toDecimalPlaces(0, Decimal.ROUND_HALF_UP).times("0.05");
    case PRICE_LIST_ROUNDING_METHOD.NEAREST_10:
      return p.div("0.10").toDecimalPlaces(0, Decimal.ROUND_HALF_UP).times("0.10");
    case PRICE_LIST_ROUNDING_METHOD.ROUND_UP:
      return p.toDecimalPlaces(0, Decimal.ROUND_CEIL);
    case PRICE_LIST_ROUNDING_METHOD.ROUND_DOWN:
      return p.toDecimalPlaces(0, Decimal.ROUND_FLOOR);
    default:
      return p.toDecimalPlaces(6, Decimal.ROUND_HALF_UP);
  }
}

export type PriceItemCandidate = {
  minQuantity: string;
  validFrom?: Date | null;
  validTo?: Date | null;
};

/**
 * Picks the applicable price list item: highest quantity break first, dated rows win ties.
 * @param items - Items of one variant within one list
 * @param baseQuantity - Quantity in base UoM (quantity × uomFactor)
 * @param at - Reference date
 */
export function selectPriceListItem<T extends PriceItemCandidate>(
  items: T[],
  baseQuantity: Decimal.Value,
  at: Date,
): T | undefined {
  const qty = new Decimal(baseQuantity);
  return items
    .filter(
      (i) =>
        (!i.validFrom || i.validFrom <= at) &&
        (!i.validTo || i.validTo >= at) &&
        new Decimal(i.minQuantity).lte(qty),
    )
    .sort(
      (a, b) =>
        new Decimal(b.minQuantity).cmp(a.minQuantity) ||
        Number(Boolean(b.validFrom)) - Number(Boolean(a.validFrom)),
    )[0];
}
