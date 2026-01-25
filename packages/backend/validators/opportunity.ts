import {
  AssignUserSchema,
  CloseOpportunityLostSchema,
  CloseOpportunityWonSchema,
  CreateOpportunitySchema,
  CustomerIdParamSchema,
  OpportunityIdSchema,
  OpportunityQueryByStatusSchema,
  OpportunityQuerySchema,
  UpdateOpportunitySchema,
  UpdateStageSchema,
} from "@mini-erp/shared";
import {
  validate,
  validateBody,
  validateParams,
} from "../middleware/validation";

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

export const validateOpportunityQuery = validateBody(
  OpportunityQuerySchema,
  "Opportunity query",
);

export const validateCustomerIdParam = validateParams(
  CustomerIdParamSchema,
  "Customer ID",
);

export const validateGetOpportunitiesByCustomer = validateParams(
  OpportunityQueryByStatusSchema,
  "Opportunity query by status",
);

export const validateGetOpportunity = validateParams(
  OpportunityIdSchema,
  "Opportunity ID",
);

export const validateCreateOpportunity = validate(
  CreateOpportunitySchema,
  "Opportunity creation",
);

export const validateUpdateOpportunity = validateParams(
  UpdateOpportunitySchema,
  "Opportunity update",
);

export const validateUpdateOpportunityStage = validate(
  UpdateStageSchema,
  "Stage update",
);

export const validateOpportunityWon = validate(
  CloseOpportunityWonSchema,
  "Close won",
);

export const validateOpportunityLost = validate(
  CloseOpportunityLostSchema,
  "Close lost",
);

export const validateOpportunityAssignUser = validate(
  AssignUserSchema,
  "Assign user",
);
