import { validateParams, validateQuery } from "../middleware/validation";
import { countryCodeSchema, countryQuerySchema } from "@mini-erp/shared/validators";

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCountryQuery = validateQuery(
  countryQuerySchema,
  "Country query"
);

export const validateCountryCode = validateParams(
  countryCodeSchema,
  "Country code"
);
