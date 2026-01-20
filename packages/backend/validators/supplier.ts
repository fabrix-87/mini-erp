import {
  CreateSupplierSchema,
  SupplierIdSchema,
  SupplierQuerySchema,
  UpdateSupplierCompanySchema,
  UpdateSupplierRatingSchema,
  UpdateSupplierSchema,
} from "@mini-erp/shared/validators";

import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCreateSupplier = validateBody(
  CreateSupplierSchema,
  "Supplier creation",
);

export const validateUpdateSupplier = validateBody(
  UpdateSupplierSchema,
  "Supplier update",
);

export const validateUpdateSupplierCompany = validateBody(
  UpdateSupplierCompanySchema,
  "Supplier company update",
);

export const validateUpdateSupplierRating = validateBody(
  UpdateSupplierRatingSchema,
  "Supplier rating update",
);

export const validateSupplierId = validateParams(
  SupplierIdSchema,
  "Supplier ID",
);

export const validateSupplierQuery = validateQuery(
  SupplierQuerySchema,
  "Supplier query",
);
