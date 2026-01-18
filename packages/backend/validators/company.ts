import { validateQuery } from "../middleware/validation";
import { CompanyQueryBaseSchema } from "@mini-erp/shared/validators";

// ============================================================================
// MIDDLEWARE
// ============================================================================

export const validateCompanyQuery = validateQuery(
  CompanyQueryBaseSchema,
  "Company search"
);
