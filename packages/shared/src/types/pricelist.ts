// packages/shared/src/types/pricelist.ts
import { z } from "zod";
import type { Customer } from "./customer";
import type { ProductVariant } from "./product";
import type { PriceListStrategy, PriceListType, PriceSource, RoundingMethod } from "../constants";
import {
  bulkImportBodySchema,
  bulkImportItemSchema,
  bulkPriceListIdParamSchema,
  createPriceListItemSchema,
  createPriceListSchema,
  priceListIdParamSchema,
  priceListItemIdParamSchema,
  priceListItemQuerySchema,
  priceListQuerySchema,
  resolvePriceQuerySchema,
  updatePriceListItemSchema,
  updatePriceListSchema,
} from "../validators/pricelist";

// ============================================================================
// ENTITY TYPES
// Decimal columns are serialized as fixed-precision strings (see createDecimalSchema).
// ============================================================================

/**
 * PriceList entity.
 */
export type PriceList = {
  id: string;
  tenantId: string;

  code: string;
  name: string;
  currencyCode: string;
  type: PriceListType;

  validFrom?: Date | null;
  validTo?: Date | null;
  active: boolean;

  /** Fallback list for the tenant and currency when the customer has no assigned list. */
  isDefault: boolean;

  parentListId?: string | null;
  parentList?: PriceList | null;
  childrenLists?: PriceList[];

  strategy: PriceListStrategy;
  /** Decimal(10,2): percentage or fixed amount depending on strategy. */
  strategyValue: string;
  roundingMethod: RoundingMethod;

  customers?: Customer[];
  items?: PriceListItem[];

  createdAt: Date;
  updatedAt: Date;
};

/**
 * PriceListItem entity. Price and quantity break are expressed in the product base UoM.
 */
export type PriceListItem = {
  id: string;
  tenantId: string;

  priceListId: string;
  priceList?: PriceList;

  variantId: string;
  variant?: ProductVariant;

  /** Decimal(15,6), lower bound of the quantity break (base UoM). */
  minQuantity: string;
  /** Decimal(20,6), unit price per base UoM. */
  price: string;
  /** Decimal(5,2), suggested line discount. Does not alter the unit price. */
  discountPercent?: string | null;

  validFrom?: Date | null;
  validTo?: Date | null;

  taxRuleId?: number | null;

  createdAt: Date;
  updatedAt: Date;
};

/**
 * Result of the price resolution hierarchy (guide section 6).
 * Manual overrides are not part of it: they are recorded on the document line
 * through originalUnitPrice and priceOverrideReason.
 */
export type ResolvedPrice = {
  source: PriceSource;
  /** Unit price per line UoM (price × uomFactor). Null when source is NONE. */
  unitPrice: string | null;
  /** Base UoM units per 1 line unit, to be snapshotted on the document line. */
  uomFactor: string;

  priceListId?: string;
  /** Set when source is PRICE_LIST_ITEM. */
  priceListItemId?: string;
  /** Quantity break that matched (base UoM). */
  appliedMinQuantity?: string;
  /** Suggested discount to prefill on the document line. */
  discountPercent?: string | null;
};

// ============================================================================
// INPUT TYPES (z.infer)
// ============================================================================

export type CreatePriceListInput = z.infer<typeof createPriceListSchema>;
export type UpdatePriceListInput = z.infer<typeof updatePriceListSchema>;
export type CreatePriceListItemInput = z.infer<typeof createPriceListItemSchema>;
export type UpdatePriceListItemInput = z.infer<typeof updatePriceListItemSchema>;
export type BulkImportItemInput = z.infer<typeof bulkImportItemSchema>;
export type BulkImportInput = z.infer<typeof bulkImportBodySchema>;
export type ResolvePriceInput = z.infer<typeof resolvePriceQuerySchema>;

// ============================================================================
// FORM VALUES (z.input)
// ============================================================================

export type CreatePriceListFormValues = z.input<typeof createPriceListSchema>;
export type UpdatePriceListFormValues = z.input<typeof updatePriceListSchema>;
export type CreatePriceListItemFormValues = z.input<typeof createPriceListItemSchema>;
export type UpdatePriceListItemFormValues = z.input<typeof updatePriceListItemSchema>;

// ============================================================================
// QUERY TYPES (z.infer)
// ============================================================================

export type PriceListQueryInput = z.infer<typeof priceListQuerySchema>;
export type PriceListItemQueryInput = z.infer<typeof priceListItemQuerySchema>;

// ============================================================================
// PARAM TYPES (z.infer)
// ============================================================================

export type PriceListIdParam = z.infer<typeof priceListIdParamSchema>;
export type PriceListItemIdParam = z.infer<typeof priceListItemIdParamSchema>;
export type BulkPriceListIdParam = z.infer<typeof bulkPriceListIdParamSchema>;
