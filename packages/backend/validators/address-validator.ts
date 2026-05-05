import {
  addressIdSchema,
  addressQuerySchema,
  createAddressSchema,
  setPrimaryAddressSchema,
  updateAddressSchema,
} from "@mini-erp/shared/validators";
import { validateBody, validateParams, validateQuery } from "../middleware/validation-middleware";

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCreateAddress = validateBody(createAddressSchema, "Address creation");

export const validateUpdateAddress = validateBody(updateAddressSchema, "Address update");

export const validateAddressId = validateParams(addressIdSchema, "Address ID");

export const validateAddressQuery = validateQuery(addressQuerySchema, "Address query");

export const validateSetPrimaryAddress = validateBody(
  setPrimaryAddressSchema,
  "Set primary address",
);
