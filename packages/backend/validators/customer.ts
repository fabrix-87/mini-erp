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
  updateLeadStatusSchema,
} from "@mini-erp/shared/validators";

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

export const validateUpdateLeadStatus = validateBody(
  updateLeadStatusSchema,
  "Lead status update",
);

export const validateCustomerId = validateParams(
  customerIdSchema,
  "Customer ID",
);

export const validateCustomerQuery = validateQuery(
  customerQuerySchema, 
  "Customer query"
);
