import {z} from "zod";
import { ProductConditionSchema, ProductTypeSchema } from "../validators/product";

export type ProductType = z.infer<typeof ProductTypeSchema>
export type ProductCondition = z.infer<typeof ProductConditionSchema>