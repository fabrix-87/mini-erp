import { validateParams, validateQuery } from "../middleware/validation";
import { CountryCodeSchema, CountryQuerySchema } from "@mini-erp/shared/validators";

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCountryQuery = validateQuery(
  CountryQuerySchema,
  "Country query"
);

export const validateCountryCode = validateParams(
  CountryCodeSchema,
  "Country code"
);
