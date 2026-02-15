// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import { Customer } from "./customer";
import {
  bulkImportBodySchema,
  bulkPriceListIdParamSchema,
  calculatePriceBodySchema,
  createPriceListItemSchema,
  createPriceListSchema,
  priceListIdParamSchema,
  priceListItemIdParamSchema,
  priceListItemQuerySchema,
  priceListQuerySchema,
  updatePriceListItemSchema,
  updatePriceListSchema,
} from "../validators";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * PriceList entity
 */
export type PriceList = CreatePriceListItemInput & {
  id: number;
  parentList?: PriceList[];
  customers?: Customer[];
  items?: PriceListItem[];

  createdAt: Date;
  updatedAt: Date;
};

/**
 * PriceListItem entity
 */
export type PriceListItem = CreatePriceListItemInput & {
  id: number;
  PriceList: PriceList;
  variant?: any; // TODO PRODUCT

  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================
export type CreatePriceListInput = z.infer<typeof createPriceListSchema>;
export type UpdatePriceListInput = z.infer<typeof updatePriceListSchema>;
export type CreatePriceListItemInput = z.infer<
  typeof createPriceListItemSchema
>;
export type UpdatePriceListItemInput = z.infer<
  typeof updatePriceListItemSchema
>;
export type BulkImportInput = z.infer<typeof bulkImportBodySchema>;
export type CalculatePriceInput = z.infer<typeof calculatePriceBodySchema>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================
export type PriceListQueryInput = z.infer<typeof priceListQuerySchema>;
export type PriceListItemQueryInput = z.infer<typeof priceListItemQuerySchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================
export type PriceListIdParam = z.infer<typeof priceListIdParamSchema>;
export type PriceListItemIdParam = z.infer<typeof priceListItemIdParamSchema>;
export type BulkPriceListIdParam = z.infer<typeof bulkPriceListIdParamSchema>;
