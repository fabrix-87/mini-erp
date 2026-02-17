import { z } from "zod";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";

import {
  checkEmailSchema,
  companyIdAsCompanyIdSchema,
  contactIdSchema,
  contactQuerySchema,
  createContactSchema,
  toggleContactActiveSchema,
  updateContactSchema,
} from "@mini-erp/shared/validators";

// ============================================================================
// CONTACT SCHEMAS
// ============================================================================

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCreateContact = validateBody(
  createContactSchema,
  "Contact creation"
);

export const validateUpdateContact = validateBody(
  updateContactSchema,
  "Contact update"
);

export const validateContactId = validateParams(contactIdSchema, "Contact ID");
export const validateCompanyId = validateParams(companyIdAsCompanyIdSchema, "Company ID");

export const validateContactQuery = validateQuery(
  contactQuerySchema,
  "Contact query"
);

export const validateCheckEmail = validateQuery(
  checkEmailSchema,
  "Contact check mail"
);

export const validateToggleContactActive = validateBody(
  toggleContactActiveSchema,
  "Toggle contact active"
);
