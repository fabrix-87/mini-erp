import { z } from "zod";
import {
  productConditionSchema,
  productOutOfStockTypeSchema,
  productPackStockTypeSchema,
  productRedirectTypeSchema,
  productStatusSchema,
  productTypeSchema,
  productVisibilitySchema,
} from "../validators/product";

export type ProductType = z.infer<typeof productTypeSchema>;
export type ProductCondition = z.infer<typeof productConditionSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
export type ProductVisibility = z.infer<typeof productVisibilitySchema>;
export type ProductRedirectType = z.infer<typeof productRedirectTypeSchema>;
export type ProductPackStockType = z.infer<typeof productPackStockTypeSchema>;
export type ProductOutOfStockType = z.infer<typeof productOutOfStockTypeSchema>;

export const PRODUCT_TYPE = {
  STANDARD: "STANDARD",
  PACK: "PACK",
  VIRTUAL: "VIRTUAL",
  SERVICE: "SERVICE",
} as const;

export const PRODUCT_CONDITION = {
  NEW: "NEW",
  USED: "USED",
  REFURBISHED: "REFURBISHED",
} as const;

export const PRODUCT_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export const PRODUCT_VISIBILITY = {
  BOTH: "BOTH",
  CATALOG: "CATALOG",
  SEARCH: "SEARCH",
  NONE: "NONE",
} as const;

export const PRODUCT_PACK_STOCK_TYPE = {
  USE_PACK_STOCK_ONLY: "USE_PACK_STOCK_ONLY",
  USE_PRODUCTS_STOCK_ONLY: "USE_PRODUCTS_STOCK_ONLY",
  USE_BOTH_STOCKS: "USE_BOTH_STOCKS",
} as const;

export const PRODUCT_OUT_OF_STOCK_TYPE = {
  DENY_ORDERS: "DENY_ORDERS",
  ALLOW_ORDERS: "ALLOW_ORDERS",
  USE_DEFAULT: "USE_DEFAULT",
} as const;

export const PRODUCT_REDIRECT_TYPE = {
  NOT_FOUND: "NOT_FOUND",
  MOVED: "MOVED",
  TEMPORARY: "TEMPORARY",
} as const;
