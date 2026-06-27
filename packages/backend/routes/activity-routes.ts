import { authorize } from "../middleware/auth-middleware";
import {
  validateActivityStatsQuery,
  validateCreateActivity,
  validateUpdateActivity,
  validateActivityId,
  validateActivityQuery,
  validateActivityPartecipantId,
  validateActivityTemplateId,
  validateUpdateActivityStatus,
  validateCompleteActivityStatus,
  validateActivityIdAsActivityId,
  validateUpdateActivityPartecipant,
  validateCreateActivityTemplate,
  validateCreateActivityFromTemplate,
  validateUpdateActivityTemplate,
} from "../validators/activity-validator";
import {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  updateActivityStatus,
  completeActivity,
  deleteActivity,
  getActivityStats,
  // partecipant
  getActivityParticipants,
  addActivityParticipant,
  updateActivityParticipant,
  removeActivityParticipant,
  addBulkParticipants,
  // template
  getAllActivityTemplates,
  getActivityTemplateById,
  createActivityTemplate,
  updateActivityTemplate,
  deleteActivityTemplate,
  createActivityFromTemplate,
  toggleTemplateActive,
} from "../controllers/activity";
import { createHonoApp } from "@/lib/hono-app";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const activityRoutes = createHonoApp();

// ============================================================================
// ACTIVITY STATS ROUTES
// ============================================================================

/**
 * @route   GET /api/activities/stats
 * @desc    Ottieni statistiche activities
 * @access  Private (activity:read)
 * @query   startDate, endDate, userId
 */
activityRoutes.get(
  "/stats",
  requireTenantScope,
  authorize(["activity:read", "activity:manage"]),
  validateActivityStatsQuery,
  getActivityStats,
);

// ============================================================================
// ACTIVITY ROUTES
// ============================================================================

/**
 * @route   GET /api/activities
 * @desc    Ottieni tutte le activities con filtri e paginazione
 * @access  Private (activity:read)
 * @query   page, limit, search, type, status, priority, outcome, companyId, customerId, opportunityId, assignedUserId, startDate, endDate, overdue, requiresFollowUp, myActivities, sortBy, sortOrder
 */
activityRoutes.get(
  "/",
  requireTenantScope,
  authorize(["activity:read", "activity:manage"]),
  validateActivityQuery,
  getAllActivities,
);

/**
 * @route   GET /api/activities/:id
 * @desc    Ottieni dettagli di un'activity specifica
 * @access  Private (activity:read)
 */
activityRoutes.get(
  "/:id",
  requireTenantScope,
  authorize(["activity:read", "activity:manage"]),
  validateActivityId,
  getActivityById,
);

/**
 * @route   POST /api/activities
 * @desc    Crea nuova activity
 * @access  Private (activity:create)
 */
activityRoutes.post(
  "/",
  requireTenantScope,
  authorize(["activity:create", "activity:manage"]),
  validateCreateActivity,
  createActivity,
);

/**
 * @route   PUT /api/activities/:id
 * @desc    Aggiorna activity esistente
 * @access  Private (activity:update)
 */
activityRoutes.put(
  "/:id",
  requireTenantScope,
  authorize(["activity:update", "activity:manage"]),
  validateActivityId,
  validateUpdateActivity,
  updateActivity,
);

/**
 * @route   PATCH /api/activities/:id/status
 * @desc    Aggiorna status dell'activity
 * @access  Private (activity:update)
 */
activityRoutes.patch(
  "/:id/status",
  requireTenantScope,
  authorize(["activity:update", "activity:manage"]),
  validateActivityId,
  validateUpdateActivityStatus,
  updateActivityStatus,
);

/**
 * @route   PATCH /api/activities/:id/complete
 * @desc    Completa un'activity
 * @access  Private (activity:update)
 */
activityRoutes.patch(
  "/:id/complete",
  requireTenantScope,
  authorize(["activity:update", "activity:manage"]),
  validateActivityId,
  validateCompleteActivityStatus,
  completeActivity,
);

/**
 * @route   DELETE /api/activities/:id
 * @desc    Elimina un'activity
 * @access  Private (activity:delete)
 */
activityRoutes.delete(
  "/:id",
  requireTenantScope,
  authorize(["activity:delete", "activity:manage"]),
  validateActivityId,
  deleteActivity,
);

// ============================================================================
// ACTIVITY PARTICIPANT ROUTES
// ============================================================================

/**
 * @route   GET /api/activities/:activityId/participants
 * @desc    Ottieni partecipanti di un'activity
 * @access  Private (activity:read)
 */
activityRoutes.get(
  "/:activityId/participants",
  requireTenantScope,
  authorize(["activity:read", "activity:manage"]),
  validateActivityIdAsActivityId,
  getActivityParticipants,
);

/**
 * @route   POST /api/activities/:activityId/participants
 * @desc    Aggiungi partecipante ad activity
 * @access  Private (activity:update)
 */
activityRoutes.post(
  "/:activityId/participants",
  requireTenantScope,
  authorize(["activity:update", "activity:manage"]),
  validateActivityIdAsActivityId,
  addActivityParticipant,
);

/**
 * @route   POST /api/activities/:activityId/participants/bulk
 * @desc    Aggiungi partecipanti multipli
 * @access  Private (activity:update)
 */
activityRoutes.post(
  "/:activityId/participants/bulk",
  requireTenantScope,
  authorize(["activity:update", "activity:manage"]),
  validateActivityIdAsActivityId,
  addBulkParticipants,
);

/**
 * @route   PUT /api/activities/participants/:id
 * @desc    Aggiorna partecipante
 * @access  Private (activity:update)
 */
activityRoutes.put(
  "/participants/:id",
  requireTenantScope,
  authorize(["activity:update", "activity:manage"]),
  validateActivityPartecipantId,
  validateUpdateActivityPartecipant,
  updateActivityParticipant,
);

/**
 * @route   DELETE /api/activities/participants/:id
 * @desc    Rimuovi partecipante
 * @access  Private (activity:update)
 */
activityRoutes.delete(
  "/participants/:id",
  requireTenantScope,
  authorize(["activity:update", "activity:manage"]),
  validateActivityPartecipantId,
  removeActivityParticipant,
);

// ============================================================================
// ACTIVITY TEMPLATE ROUTES
// ============================================================================

/**
 * @route   GET /api/activity-templates
 * @desc    Ottieni tutti i templates
 * @access  Private (activity:read)
 * @query   active, type, sortBy, sortOrder
 */
activityRoutes.get(
  "/templates",
  requireTenantScope,
  authorize(["activity:read", "activity:manage"]),
  getAllActivityTemplates,
);

/**
 * @route   GET /api/activity-templates/:id
 * @desc    Ottieni template per ID
 * @access  Private (activity:read)
 */
activityRoutes.get(
  "/templates/:id",
  requireTenantScope,
  authorize(["activity:read", "activity:manage"]),
  validateActivityTemplateId,
  getActivityTemplateById,
);

/**
 * @route   POST /api/activity-templates
 * @desc    Crea nuovo template
 * @access  Private (activity:manage)
 */
activityRoutes.post(
  "/templates",
  requireTenantScope,
  authorize(["activity:manage"]),
  validateCreateActivityTemplate,
  createActivityTemplate,
);

/**
 * @route   POST /api/activity-templates/:id/create-activity
 * @desc    Crea activity da template
 * @access  Private (activity:create)
 */
activityRoutes.post(
  "/templates/:id/create-activity",
  requireTenantScope,
  authorize(["activity:create", "activity:manage"]),
  validateActivityTemplateId,
  validateCreateActivityFromTemplate,
  createActivityFromTemplate,
);

/**
 * @route   PUT /api/activity-templates/:id
 * @desc    Aggiorna template
 * @access  Private (activity:manage)
 */
activityRoutes.put(
  "/templates/:id",
  requireTenantScope,
  authorize(["activity:manage"]),
  validateActivityTemplateId,
  validateUpdateActivityTemplate,
  updateActivityTemplate,
);

/**
 * @route   PATCH /api/activity-templates/:id/toggle-active
 * @desc    Attiva/Disattiva template
 * @access  Private (activity:manage)
 */
activityRoutes.patch(
  "/templates/:id/toggle-active",
  requireTenantScope,
  authorize(["activity:manage"]),
  validateActivityTemplateId,
  toggleTemplateActive,
);

/**
 * @route   DELETE /api/activity-templates/:id
 * @desc    Elimina template
 * @access  Private (activity:manage)
 */
activityRoutes.delete(
  "/templates/:id",
  requireTenantScope,
  authorize(["activity:manage"]),
  validateActivityTemplateId,
  deleteActivityTemplate,
);

// ============================================================================
// EXPORT
// ============================================================================

export default activityRoutes;
