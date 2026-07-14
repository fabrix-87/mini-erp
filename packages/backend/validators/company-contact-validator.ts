import { validateBody, validateParams } from "../middleware/validation-middleware";
import {
  createCompanyContactSchema,
  createCuidSchema,
  updateCompanyContactSchema,
} from "@mini-erp/shared/validators";
import { z } from "zod";

// ============================================================================
// PARAMS SCHEMA (backend-only — not in shared)
// ============================================================================

/**
 * Composite param schema for routes using /:contactId/:companyId.
 */
export const companyContactParamsSchema = z.object({
  contactId: createCuidSchema("Contact ID non valido"),
  companyId: createCuidSchema("Company ID non valido"),
});

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

/** Validates body for POST /company-contacts */
export const validateCreateCompanyContact = validateBody(
  createCompanyContactSchema,
  "CompanyContact creation",
);

/** Validates body for PATCH /company-contacts/:contactId/:companyId */
export const validateUpdateCompanyContact = validateBody(
  updateCompanyContactSchema,
  "CompanyContact update",
);

/** Validates :contactId and :companyId route params */
export const validateCompanyContactParams = validateParams(
  companyContactParamsSchema,
  "CompanyContact params",
);
