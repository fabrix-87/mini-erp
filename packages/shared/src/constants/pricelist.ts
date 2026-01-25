import { z } from "zod";
import {
  PriceListStrategySchema,
  PriceListTypeSchema,
  RoundingMethodSchema,
} from "../validators";

export type PriceListType = z.infer<typeof PriceListTypeSchema>;
export type PriceListStrategy = z.infer<typeof PriceListStrategySchema>;
export type RoundingMethod = z.infer<typeof RoundingMethodSchema>;
