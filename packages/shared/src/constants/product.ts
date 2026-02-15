import { z } from "zod";
import {
  productConditionSchema,
  productStatusSchema,
  productTypeSchema,
} from "../validators/product";

export type ProductType = z.infer<typeof productTypeSchema>;
export type ProductCondition = z.infer<typeof productConditionSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
