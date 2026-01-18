import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import {
  CreateCustomerSchema,
  CustomerIdSchema,
  UpdateCustomerCompanySchema,
  UpdateCustomerSchema,
  UpdateLeadStatusSchema,
} from "@mini-erp/shared/validators";
import { CustomerQuerySchema } from "./dashboard";

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCreateCustomer = validateBody(
  CreateCustomerSchema,
  "Customer creation",
);

export const validateUpdateCustomer = validateBody(
  UpdateCustomerSchema,
  "Customer update",
);

export const validateUpdateCustomerCompany = validateBody(
  UpdateCustomerCompanySchema,
  "Customer company update",
);

export const validateUpdateLeadStatus = validateBody(
  UpdateLeadStatusSchema,
  "Lead status update",
);

export const validateCustomerId = validateParams(
  CustomerIdSchema,
  "Customer ID",
);

export const validateCustomerQuery = validateQuery(
  CustomerQuerySchema, 
  "Customer query"
);
