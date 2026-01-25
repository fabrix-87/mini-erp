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
} from "@mini-erp/shared";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

export const validateCreatePriceList = validateBody(
  CreatePriceListSchema,
  "Price list creation",
);

export const validateUpdatePriceList = validateBody(
  UpdatePriceListSchema,
  "Price list update",
);

export const validateCreatePriceListItem = validateBody(
  CreatePriceListItemSchema,
  "Price list item creation",
);

export const validateUpdatePriceListItem = validateBody(
  UpdatePriceListItemSchema,
  "Price list item update",
);

export const validateBulkImportItems = validateBody(
  BulkImportBodySchema,
  "Bulk import items",
);

export const validateCalculatePrice = validateBody(
  CalculatePriceBodySchema,
  "Calculate price",
);

export const validatePriceListId = validateParams(
  PriceListIdParamSchema,
  "Price List ID",
);

export const validatePriceListItemId = validateParams(
  PriceListItemIdParamSchema,
  "Price List Item ID",
);

export const validateBulkPriceListId = validateParams(
  BulkPriceListIdParamSchema,
  "Bulk Price List ID",
);

export const validatePriceListQuery = validateQuery(
  PriceListQuerySchema,
  "Price List query",
);

export const validatePriceListItemQuery = validateQuery(
  PriceListItemQuerySchema,
  "Price List Item query",
);
