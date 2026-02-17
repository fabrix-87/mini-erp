import { validateQuery } from "../middleware/validation";
import { companyQueryBaseSchema } from "@mini-erp/shared/validators";

// ============================================================================
// MIDDLEWARE
// ============================================================================

export const validateCompanyQuery = validateQuery(
  companyQueryBaseSchema,
  "Company search"
);
