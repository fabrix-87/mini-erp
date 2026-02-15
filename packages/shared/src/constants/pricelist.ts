import { z } from "zod";
import {
  priceListStrategySchema,
  priceListTypeSchema,
  roundingMethodSchema,
} from "../validators";

export type PriceListType = z.infer<typeof priceListTypeSchema>;
export type PriceListStrategy = z.infer<typeof priceListStrategySchema>;
export type RoundingMethod = z.infer<typeof roundingMethodSchema>;
