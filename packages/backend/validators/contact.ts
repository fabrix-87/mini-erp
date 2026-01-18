import { z } from "zod";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";

import {
  CheckEmailSchema,
  CompanyIdAsCompanyIdSchema,
  ContactIdSchema,
  ContactQuerySchema,
  CreateContactSchema,
  ToggleContactActiveSchema,
  UpdateContactSchema,
} from "@mini-erp/shared/validators";

// ============================================================================
// CONTACT SCHEMAS
// ============================================================================

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCreateContact = validateBody(
  CreateContactSchema,
  "Contact creation"
);

export const validateUpdateContact = validateBody(
  UpdateContactSchema,
  "Contact update"
);

export const validateContactId = validateParams(ContactIdSchema, "Contact ID");
export const validateCompanyId = validateParams(CompanyIdAsCompanyIdSchema, "Company ID");

export const validateContactQuery = validateQuery(
  ContactQuerySchema,
  "Contact query"
);

export const validateCheckEmail = validateQuery(
  CheckEmailSchema,
  "Contact check mail"
);

export const validateToggleContactActive = validateBody(
  ToggleContactActiveSchema,
  "Toggle contact active"
);
