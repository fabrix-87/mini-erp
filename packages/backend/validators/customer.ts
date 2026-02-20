import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import {
  createCustomerSchema,
  customerIdSchema,
  customerQuerySchema,
  updateCustomerCompanySchema,
  updateCustomerSchema,  
} from "@mini-erp/shared/validators/customer";

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCreateCustomer = validateBody(
  createCustomerSchema,
  "Customer creation",
);

export const validateUpdateCustomer = validateBody(
  updateCustomerSchema,
  "Customer update",
);

export const validateUpdateCustomerCompany = validateBody(
  updateCustomerCompanySchema,
  "Customer company update",
);

export const validateCustomerId = validateParams(
  customerIdSchema,
  "Customer ID",
);

export const validateCustomerQuery = validateQuery(
  customerQuerySchema, 
  "Customer query"
);
