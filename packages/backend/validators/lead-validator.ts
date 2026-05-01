import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  updateLeadScoreSchema,
  qualifyLeadSchema,
  convertLeadSchema,
  bulkAssignLeadsSchema,
  bulkUpdateLeadStatusSchema,
  leadQuerySchema,
  leadIdParamSchema,
  leadStatsSchema,
} from "@mini-erp/shared";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation-middleware";

// ============================================================================
// LEAD PARAM VALIDATORS
// ============================================================================

/** Validates lead :id param */
export const validateLeadId = validateParams(leadIdParamSchema, "Lead ID");

// ============================================================================
// LEAD QUERY VALIDATORS
// ============================================================================

/** Validates GET /leads query string */
export const validateLeadQuery = validateQuery(leadQuerySchema, "Lead query");

/** Validates GET /leads/stats query string */
export const validateLeadStats = validateQuery(leadStatsSchema, "Lead stats");

// ============================================================================
// LEAD BODY VALIDATORS
// ============================================================================

/** Validates POST /leads body */
export const validateCreateLead = validateBody(
  createLeadSchema,
  "Lead creation",
);

/** Validates PUT /leads/:id body */
export const validateUpdateLead = validateBody(
  updateLeadSchema,
  "Lead update",
);

/** Validates PATCH /leads/:id/status body */
export const validateUpdateLeadStatus = validateBody(
  updateLeadStatusSchema,
  "Lead status update",
);

/** Validates PATCH /leads/:id/score body */
export const validateUpdateLeadScore = validateBody(
  updateLeadScoreSchema,
  "Lead score update",
);

/** Validates PATCH /leads/:id/qualify body */
export const validateQualifyLead = validateBody(
  qualifyLeadSchema,
  "Lead qualification",
);

/** Validates POST /leads/:id/convert body */
export const validateConvertLead = validateBody(
  convertLeadSchema,
  "Lead conversion",
);

/** Validates POST /leads/bulk/assign body */
export const validateBulkAssignLeads = validateBody(
  bulkAssignLeadsSchema,
  "Bulk lead assignment",
);

/** Validates POST /leads/bulk/status body */
export const validateBulkUpdateLeadStatus = validateBody(
  bulkUpdateLeadStatusSchema,
  "Bulk lead status update",
);
