import { validateParams, validateQuery } from "../middleware/validation-middleware";
import { companyIdSchema, companyQueryBaseSchema } from "@mini-erp/shared/validators";

// ============================================================================
// MIDDLEWARE
// ============================================================================

export const validateCompanyQuery = validateQuery(
  companyQueryBaseSchema,
  "Company search"
);

export const validateCompanyIdParam = validateParams(
  companyIdSchema,
  "Company ID"
);
