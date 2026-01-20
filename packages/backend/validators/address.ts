import {
  AddressIdSchema,
  AddressQuerySchema,
  CreateAddressSchema,
  SetPrimaryAddressSchema,
  UpdateAddressSchema,
} from "@mini-erp/shared/validators";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCreateAddress = validateBody(
  CreateAddressSchema,
  "Address creation",
);

export const validateUpdateAddress = validateBody(
  UpdateAddressSchema,
  "Address update",
);

export const validateAddressId = validateParams(AddressIdSchema, "Address ID");

export const validateAddressQuery = validateQuery(
  AddressQuerySchema,
  "Address query",
);

export const validateSetPrimaryAddress = validateBody(
  SetPrimaryAddressSchema,
  "Set primary address",
);
