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

export const PRODUCT_SORT_FIELDS = ["createdAt", "updatedAt", "reference", "status"] as const;

/** Maximum number of variant axes per product (Prisma doc recommends 3). */
export const MAX_PRODUCT_VARIANT_AXES = 3;

/** Smallest strictly positive value for Decimal(15,6) quantities. */
export const MIN_POSITIVE_QUANTITY = "0.000001";

export type ProductType = (typeof PRODUCT_TYPE)[keyof typeof PRODUCT_TYPE];
export type ProductCondition = (typeof PRODUCT_CONDITION)[keyof typeof PRODUCT_CONDITION];
export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];
export type ProductVisibility = (typeof PRODUCT_VISIBILITY)[keyof typeof PRODUCT_VISIBILITY];
export type ProductRedirectType = (typeof PRODUCT_REDIRECT_TYPE)[keyof typeof PRODUCT_REDIRECT_TYPE];
export type ProductPackStockType = (typeof PRODUCT_PACK_STOCK_TYPE)[keyof typeof PRODUCT_PACK_STOCK_TYPE];
export type ProductOutOfStockType = (typeof PRODUCT_OUT_OF_STOCK_TYPE)[keyof typeof PRODUCT_OUT_OF_STOCK_TYPE];
