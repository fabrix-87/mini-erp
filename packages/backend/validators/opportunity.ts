import {
  createOpportunitySchema,
  customerIdParamSchema,
  opportunityIdSchema,
  opportunityQuerySchema,
  updateOpportunitySchema,
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
  opportunityQuerySchema,
  "Opportunity query",
);

export const validateCustomerIdParam = validateParams(
  customerIdParamSchema,
  "Customer ID",
);

/*
export const validateGetOpportunitiesByCustomer = validateParams(
  opportunityQueryByStatusSchema,
  "Opportunity query by status",
);
*/

export const validateGetOpportunity = validateParams(
  opportunityIdSchema,
  "Opportunity ID",
);

export const validateCreateOpportunity = validate(
  createOpportunitySchema,
  "Opportunity creation",
);

export const validateUpdateOpportunity = validateParams(
  updateOpportunitySchema,
  "Opportunity update",
);

/*
export const validateUpdateOpportunityStage = validate(
  updateStageSchema,
  "Stage update",
);

export const validateOpportunityWon = validate(
  closeOpportunityWonSchema,
  "Close won",
);

export const validateOpportunityLost = validate(
  closeOpportunityLostSchema,
  "Close lost",
);

export const validateOpportunityAssignUser = validate(
  assignUserSchema,
  "Assign user",
);
*/