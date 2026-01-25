// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import {
  BulkImportBodySchema,
  BulkPriceListIdParamSchema,
  CalculatePriceBodySchema,
  CreatePriceListItemSchema,
  CreatePriceListSchema,
  PriceListIdParamSchema,
  PriceListItemIdParamSchema,
  PriceListItemQuerySchema,
  PriceListQuerySchema,
  UpdatePriceListItemSchema,
  UpdatePriceListSchema,
} from "../validators";
import { Customer } from "./customer";

// Entity Types
export type PriceList = CreatePriceListItemInput & {
    id: number;
    parentList?: PriceList[];
    customers?: Customer[];
    items?: PriceListItem[];

    createdAt: Date;
    updatedAt: Date;
}

export type PriceListItem = CreatePriceListItemInput & {
    id: number;
    PriceList: PriceList;
    variant?: any;      // TODO PRODUCT

    createdAt: Date;
    updatedAt: Date;
}

// Input Types
export type CreatePriceListInput = z.infer<typeof CreatePriceListSchema>;
export type UpdatePriceListInput = z.infer<typeof UpdatePriceListSchema>;
export type CreatePriceListItemInput = z.infer<
  typeof CreatePriceListItemSchema
>;
export type UpdatePriceListItemInput = z.infer<
  typeof UpdatePriceListItemSchema
>;
export type BulkImportInput = z.infer<typeof BulkImportBodySchema>;
export type CalculatePriceInput = z.infer<typeof CalculatePriceBodySchema>;

// Query Types
export type PriceListQueryInput = z.infer<typeof PriceListQuerySchema>;
export type PriceListItemQueryInput = z.infer<typeof PriceListItemQuerySchema>;

// Param Types
export type PriceListIdParam = z.infer<typeof PriceListIdParamSchema>
export type PriceListItemIdParam = z.infer<typeof PriceListItemIdParamSchema>
export type BulkPriceListIdParam = z.infer<typeof BulkPriceListIdParamSchema>
