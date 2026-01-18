import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";

import {
  ActivityIdAsActivityIdSchema,
  ActivityIdSchema,
  ActivityParticipantIdSchema,
  ActivityQuerySchema,
  ActivityStatsSchema,
  ActivityTemplateIdSchema,
  CompleteActivitySchema,
  CreateActivityFromTemplateSchema,
  CreateActivitySchema,
  CreateActivityTemplateSchema,
  UpdateActivityParticipantSchema,
  UpdateActivitySchema,
  UpdateActivityStatusSchema,
  UpdateActivityTemplateSchema,
} from "@mini-erp/shared/validators";

// ============================================================================
// MIDDLEWARE
// ============================================================================

export const validateActivityId = validateParams(
  ActivityIdSchema,
  "Activity ID"
);
export const validateActivityIdAsActivityId = validateQuery(
  ActivityIdAsActivityIdSchema,
  "Activity query"
);
export const validateActivityPartecipantId = validateQuery(
  ActivityParticipantIdSchema,
  "Activity query"
);
export const validateActivityTemplateId = validateQuery(
  ActivityTemplateIdSchema,
  "Activity query"
);

export const validateActivityStatsQuery = validateQuery(
  ActivityStatsSchema,
  "Activity stats"
);

export const validateCreateActivity = validateBody(
  CreateActivitySchema,
  "Activity creation"
);

export const validateUpdateActivity = validateBody(
  UpdateActivitySchema,
  "Activity modification"
);

export const validateActivityQuery = validateQuery(
  ActivityQuerySchema,
  "Activity query"
);

export const validateUpdateActivityStatus = validateBody(
  UpdateActivityStatusSchema,
  "Activity modification status"
);

export const validateCompleteActivityStatus = validateBody(
  CompleteActivitySchema,
  "Activity complete status"
);

export const validateUpdateActivityPartecipant = validateBody(
  UpdateActivityParticipantSchema,
  "Participant update"
);

export const validateCreateActivityTemplate = validateBody(
  CreateActivityTemplateSchema,
  "Template creation"
);

export const validateCreateActivityFromTemplate = validateBody(
  CreateActivityFromTemplateSchema,
  "Create activity from template"
);

export const validateUpdateActivityTemplate = validateBody(
  UpdateActivityTemplateSchema,
  "Template update"
);
