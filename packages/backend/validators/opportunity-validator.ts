import {
  createOpportunitySchema,
  updateOpportunitySchema,
  updateOpportunityStageSchema,
  updateOpportunityStatusSchema,
  winOpportunitySchema,
  loseOpportunitySchema,
  bulkAssignOpportunitiesSchema,
  bulkUpdateStageSchema,
  opportunityQuerySchema,
  closedReasonQuerySchema,
  createClosedReasonSchema,
  updateClosedReasonSchema,
  opportunityIdParamSchema,
  closedReasonIdParamSchema,
  customerIdParamSchema,
  opportunityStatsSchema,
  salesFunnelAnalysisSchema,
} from "@mini-erp/shared";
import { validateBody, validateParams, validateQuery } from "../middleware/validation-middleware";

// ============================================================================
// OPPORTUNITY PARAM VALIDATORS
// ============================================================================

/** Validates opportunity :id param */
export const validateOpportunityId = validateParams(opportunityIdParamSchema, "Opportunity ID");

/** Validates customer :customerId param */
export const validateCustomerIdParam = validateParams(customerIdParamSchema, "Customer ID");

/** Validates closed-reason :id param */
export const validateClosedReasonId = validateParams(closedReasonIdParamSchema, "Closed Reason ID");

// ============================================================================
// OPPORTUNITY QUERY VALIDATORS
// ============================================================================

/** Validates GET /opportunities query string */
export const validateOpportunityQuery = validateQuery(opportunityQuerySchema, "Opportunity query");

/** Validates GET /opportunities/stats query string */
export const validateOpportunityStats = validateQuery(opportunityStatsSchema, "Opportunity stats");

/** Validates GET /opportunities/stats/funnel query string */
export const validateSalesFunnelQuery = validateQuery(
  salesFunnelAnalysisSchema,
  "Sales funnel analysis",
);

/** Validates GET /closed-reasons query string */
export const validateClosedReasonQuery = validateQuery(
  closedReasonQuerySchema,
  "Closed reason query",
);

// ============================================================================
// OPPORTUNITY BODY VALIDATORS
// ============================================================================

/** Validates POST /opportunities body */
export const validateCreateOpportunity = validateBody(
  createOpportunitySchema,
  "Opportunity creation",
);

/** Validates PUT /opportunities/:id body */
export const validateUpdateOpportunity = validateBody(
  updateOpportunitySchema,
  "Opportunity update",
);

/** Validates PATCH /opportunities/:id/stage body */
export const validateUpdateOpportunityStage = validateBody(
  updateOpportunityStageSchema,
  "Opportunity stage update",
);

/** Validates PATCH /opportunities/:id/status body */
export const validateUpdateOpportunityStatus = validateBody(
  updateOpportunityStatusSchema,
  "Opportunity status update",
);

/** Validates PATCH /opportunities/:id/close-won body */
export const validateWinOpportunity = validateBody(winOpportunitySchema, "Opportunity close won");

/** Validates PATCH /opportunities/:id/close-lost body */
export const validateLoseOpportunity = validateBody(
  loseOpportunitySchema,
  "Opportunity close lost",
);

/** Validates POST /opportunities/bulk/assign body */
export const validateBulkAssignOpportunities = validateBody(
  bulkAssignOpportunitiesSchema,
  "Bulk opportunity assignment",
);

/** Validates POST /opportunities/bulk/stage body */
export const validateBulkUpdateStage = validateBody(bulkUpdateStageSchema, "Bulk stage update");

// ============================================================================
// CLOSED REASON BODY VALIDATORS
// ============================================================================

/** Validates POST /closed-reasons body */
export const validateCreateClosedReason = validateBody(
  createClosedReasonSchema,
  "Closed reason creation",
);

/** Validates PUT /closed-reasons/:id body */
export const validateUpdateClosedReason = validateBody(
  updateClosedReasonSchema,
  "Closed reason update",
);
