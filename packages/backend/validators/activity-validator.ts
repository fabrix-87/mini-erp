import {
  activityIdAsActivityIdSchema,
  activityIdSchema,
  activityParticipantIdSchema,
  activityQuerySchema,
  activityStatsSchema,
  activityTemplateIdSchema,
  completeActivitySchema,
  createActivityFromTemplateSchema,
  createActivitySchema,
  createActivityTemplateSchema,
  updateActivityParticipantSchema,
  updateActivitySchema,
  updateActivityStatusSchema,
  updateActivityTemplateSchema,
} from "@mini-erp/shared";
import { validateBody, validateParams, validateQuery } from "../middleware/validation-middleware";

// ============================================================================
// MIDDLEWARE
// ============================================================================

export const validateActivityId = validateParams(activityIdSchema, "Activity ID");
export const validateActivityIdAsActivityId = validateQuery(
  activityIdAsActivityIdSchema,
  "Activity query",
);
export const validateActivityPartecipantId = validateQuery(
  activityParticipantIdSchema,
  "Activity query",
);
export const validateActivityTemplateId = validateQuery(activityTemplateIdSchema, "Activity query");

export const validateActivityStatsQuery = validateQuery(activityStatsSchema, "Activity stats");

export const validateCreateActivity = validateBody(createActivitySchema, "Activity creation");

export const validateUpdateActivity = validateBody(updateActivitySchema, "Activity modification");

export const validateActivityQuery = validateQuery(activityQuerySchema, "Activity query");

export const validateUpdateActivityStatus = validateBody(
  updateActivityStatusSchema,
  "Activity modification status",
);

export const validateCompleteActivityStatus = validateBody(
  completeActivitySchema,
  "Activity complete status",
);

export const validateUpdateActivityPartecipant = validateBody(
  updateActivityParticipantSchema,
  "Participant update",
);

export const validateCreateActivityTemplate = validateBody(
  createActivityTemplateSchema,
  "Template creation",
);

export const validateCreateActivityFromTemplate = validateBody(
  createActivityFromTemplateSchema,
  "Create activity from template",
);

export const validateUpdateActivityTemplate = validateBody(
  updateActivityTemplateSchema,
  "Template update",
);
