// packages/shared/src/helpers/price-list-helper.ts
import Decimal from "decimal.js";
import { PRICE_LIST_ROUNDING_METHOD, PRICE_LIST_STRATEGY } from "../constants";
import type { PriceListStrategy, RoundingMethod } from "../constants";

const CENTS = new Decimal("0.01");
const FIVE_CENTS = new Decimal("0.05");
const TEN_CENTS = new Decimal("0.10");

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
 * Rounds a computed price to currency cents, applying the list granularity.
 * Applied once, to the final price of a derived list (never to explicit items).
 * @param price - Price before rounding
 * @param method - Rounding method of the requested price list
 * @returns Price with exactly 2 decimal places
 */
export function roundPrice(price: Decimal.Value, method: RoundingMethod): string {
  const value = new Decimal(price);
  let rounded: Decimal;
  switch (method) {
    case PRICE_LIST_ROUNDING_METHOD.NEAREST_05:
      rounded = value.div("0.05").toDecimalPlaces(0, Decimal.ROUND_HALF_UP).times("0.05");
      break;
    case PRICE_LIST_ROUNDING_METHOD.NEAREST_10:
      rounded = value.div("0.10").toDecimalPlaces(0, Decimal.ROUND_HALF_UP).times("0.10");
      break;
    case PRICE_LIST_ROUNDING_METHOD.ROUND_UP:
      rounded = value.toDecimalPlaces(2, Decimal.ROUND_CEIL);
      break;
    case PRICE_LIST_ROUNDING_METHOD.ROUND_DOWN:
      rounded = value.toDecimalPlaces(2, Decimal.ROUND_FLOOR);
      break;
    default:
      rounded = value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }
  return rounded.toFixed(2);
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
