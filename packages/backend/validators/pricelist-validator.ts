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
} from "@mini-erp/shared";
import { validateBody, validateParams, validateQuery } from "../middleware/validation-middleware";

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

export const validateCreatePriceList = validateBody(createPriceListSchema, "Price list creation");

export const validateUpdatePriceList = validateBody(updatePriceListSchema, "Price list update");

export const validateCreatePriceListItem = validateBody(
  createPriceListItemSchema,
  "Price list item creation",
);

export const validateUpdatePriceListItem = validateBody(
  updatePriceListItemSchema,
  "Price list item update",
);

export const validateBulkImportItems = validateBody(bulkImportBodySchema, "Bulk import items");

export const validateCalculatePrice = validateBody(calculatePriceBodySchema, "Calculate price");

export const validatePriceListId = validateParams(priceListIdParamSchema, "Price List ID");

export const validatePriceListItemId = validateParams(
  priceListItemIdParamSchema,
  "Price List Item ID",
);

export const validateBulkPriceListId = validateParams(
  bulkPriceListIdParamSchema,
  "Bulk Price List ID",
);

export const validatePriceListQuery = validateQuery(priceListQuerySchema, "Price List query");

export const validatePriceListItemQuery = validateQuery(
  priceListItemQuerySchema,
  "Price List Item query",
);
