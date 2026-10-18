export const PRICE_LIST_TYPE = {
  SALE: "SALE",
  PROMOTION: "PROMOTION",
  CONTRACT: "CONTRACT",
} as const;

export const PRICE_LIST_STRATEGY = {
  EXPLICIT: "EXPLICIT",
  PERCENT_DECREASE: "PERCENT_DECREASE",
  PERCENT_INCREASE: "PERCENT_INCREASE",
  FIXED_DECREASE: "FIXED_DECREASE",
  FIXED_INCREASE: "FIXED_INCREASE",
} as const;

export const PRICE_LIST_ROUNDING_METHOD = {
  NONE: "NONE",
  NEAREST_05: "NEAREST_05",
  NEAREST_10: "NEAREST_10",
  ROUND_UP: "ROUND_UP",
  ROUND_DOWN: "ROUND_DOWN",
} as const;

export type PriceListType = (typeof PRICE_LIST_TYPE)[keyof typeof PRICE_LIST_TYPE];
export type PriceListStrategy = (typeof PRICE_LIST_STRATEGY)[keyof typeof PRICE_LIST_STRATEGY];
export type RoundingMethod =
  (typeof PRICE_LIST_ROUNDING_METHOD)[keyof typeof PRICE_LIST_ROUNDING_METHOD];

export const PRICE_LIST_SORT_FIELDS = [
  "code",
  "name",
  "type",
  "currencyCode",
  "validFrom",
  "validTo",
] as const;
export const PRICE_LIST_ITEM_SORT_FIELDS = ["variantId", "minQuantity", "price"] as const;
export const MAX_PRICE_LIST_BULK_ITEMS = 1000;
/** Smallest positive unit price representable by Decimal(20,6). */
export const MIN_POSITIVE_UNIT_PRICE = "0.000001";

export const PRICE_SOURCE = {
  PRICE_LIST_ITEM: "PRICE_LIST_ITEM",
  MANUAL_OVERRIDE: "MANUAL_OVERRIDE",
  NONE: "NONE",
  DERIVED: "DERIVED",
} as const;
export type PriceSource = (typeof PRICE_SOURCE)[keyof typeof PRICE_SOURCE];

/** Maximum depth of the parent price list chain. */
export const MAX_PRICE_LIST_DEPTH = 5;
