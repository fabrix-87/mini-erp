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
    NONE: "NONE",
    NEAREST_05: "NEAREST_05",
    NEAREST_10: "NEAREST_10",
    ROUND_UP: "ROUND_UP",
    ROUND_DOWN: "ROUND_DOWN",
} as const;