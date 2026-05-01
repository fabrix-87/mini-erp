import {
  createSupplierSchema,
  supplierIdSchema,
  supplierQuerySchema,
  updateSupplierCompanySchema,
  updateSupplierRatingSchema,
  updateSupplierSchema,
} from "@mini-erp/shared/validators";

import { validateBody, validateParams, validateQuery } from "../middleware/validation-middleware";

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCreateSupplier = validateBody(createSupplierSchema, "Supplier creation");

export const validateUpdateSupplier = validateBody(updateSupplierSchema, "Supplier update");

export const validateUpdateSupplierCompany = validateBody(
  updateSupplierCompanySchema,
  "Supplier company update",
);

export const validateUpdateSupplierRating = validateBody(
  updateSupplierRatingSchema,
  "Supplier rating update",
);

export const validateSupplierId = validateParams(supplierIdSchema, "Supplier ID");

export const validateSupplierQuery = validateQuery(supplierQuerySchema, "Supplier query");
