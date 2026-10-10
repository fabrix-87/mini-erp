import { z } from "zod";
import {
  priceListStrategySchema,
  priceListTypeSchema,
  roundingMethodSchema,
} from "../validators";

export type PriceListType = z.infer<typeof priceListTypeSchema>;
export type PriceListStrategy = z.infer<typeof priceListStrategySchema>;
export type RoundingMethod = z.infer<typeof roundingMethodSchema>;

export const PRICE_LIST_TYPE = {
    SALE: "SALE",
    PURCHASE: "PURCHASE",
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
    none: "none",
    nearest_05: "nearest_05",
    nearest_10: "nearest_10",
    up: "up",
    down: "down",
} as const;