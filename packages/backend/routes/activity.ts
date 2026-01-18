import express from "express";
import { authenticateToken, authorize } from "../middleware/auth";
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
} from "../validators/activity";
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

const router = express.Router();

// ============================================================================
// ACTIVITY STATS ROUTES
// ============================================================================

/**
 * @route   GET /api/activities/stats
 * @desc    Ottieni statistiche activities
 * @access  Private (activity:read)
 * @query   startDate, endDate, userId
 */
router.get(
  "/stats",
  authenticateToken,
  authorize(["activity:read", "activity:manage"]),
  validateActivityStatsQuery,
  getActivityStats
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
router.get(
  "/",
  authenticateToken,
  authorize(["activity:read", "activity:manage"]),
  validateActivityQuery,
  getAllActivities
);

/**
 * @route   GET /api/activities/:id
 * @desc    Ottieni dettagli di un'activity specifica
 * @access  Private (activity:read)
 */
router.get(
  "/:id",
  authenticateToken,
  authorize(["activity:read", "activity:manage"]),
  validateActivityId,
  getActivityById
);

/**
 * @route   POST /api/activities
 * @desc    Crea nuova activity
 * @access  Private (activity:create)
 */
router.post(
  "/",
  authenticateToken,
  authorize(["activity:create", "activity:manage"]),
  validateCreateActivity,
  createActivity
);

/**
 * @route   PUT /api/activities/:id
 * @desc    Aggiorna activity esistente
 * @access  Private (activity:update)
 */
router.put(
  "/:id",
  authenticateToken,
  authorize(["activity:update", "activity:manage"]),
  validateActivityId,
  validateUpdateActivity,
  updateActivity
);

/**
 * @route   PATCH /api/activities/:id/status
 * @desc    Aggiorna status dell'activity
 * @access  Private (activity:update)
 */
router.patch(
  "/:id/status",
  authenticateToken,
  authorize(["activity:update", "activity:manage"]),
  validateActivityId,
  validateUpdateActivityStatus,
  updateActivityStatus
);

/**
 * @route   PATCH /api/activities/:id/complete
 * @desc    Completa un'activity
 * @access  Private (activity:update)
 */
router.patch(
  "/:id/complete",
  authenticateToken,
  authorize(["activity:update", "activity:manage"]),
  validateActivityId,
  validateCompleteActivityStatus,
  completeActivity
);

/**
 * @route   DELETE /api/activities/:id
 * @desc    Elimina un'activity
 * @access  Private (activity:delete)
 */
router.delete(
  "/:id",
  authenticateToken,
  authorize(["activity:delete", "activity:manage"]),
  validateActivityId,
  deleteActivity
);

// ============================================================================
// ACTIVITY PARTICIPANT ROUTES
// ============================================================================

/**
 * @route   GET /api/activities/:activityId/participants
 * @desc    Ottieni partecipanti di un'activity
 * @access  Private (activity:read)
 */
router.get(
  "/:activityId/participants",
  authenticateToken,
  authorize(["activity:read", "activity:manage"]),
  validateActivityIdAsActivityId,
  getActivityParticipants
);

/**
 * @route   POST /api/activities/:activityId/participants
 * @desc    Aggiungi partecipante ad activity
 * @access  Private (activity:update)
 */
router.post(
  "/:activityId/participants",
  authenticateToken,
  authorize(["activity:update", "activity:manage"]),
  validateActivityIdAsActivityId,
  addActivityParticipant
);

/**
 * @route   POST /api/activities/:activityId/participants/bulk
 * @desc    Aggiungi partecipanti multipli
 * @access  Private (activity:update)
 */
router.post(
  "/:activityId/participants/bulk",
  authenticateToken,
  authorize(["activity:update", "activity:manage"]),
  validateActivityIdAsActivityId,
  addBulkParticipants
);

/**
 * @route   PUT /api/activities/participants/:id
 * @desc    Aggiorna partecipante
 * @access  Private (activity:update)
 */
router.put(
  "/participants/:id",
  authenticateToken,
  authorize(["activity:update", "activity:manage"]),
  validateActivityPartecipantId,
  validateUpdateActivityPartecipant,
  updateActivityParticipant
);

/**
 * @route   DELETE /api/activities/participants/:id
 * @desc    Rimuovi partecipante
 * @access  Private (activity:update)
 */
router.delete(
  "/participants/:id",
  authenticateToken,
  authorize(["activity:update", "activity:manage"]),
  validateActivityPartecipantId,
  removeActivityParticipant
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
router.get(
  "/templates",
  authenticateToken,
  authorize(["activity:read", "activity:manage"]),
  getAllActivityTemplates
);

/**
 * @route   GET /api/activity-templates/:id
 * @desc    Ottieni template per ID
 * @access  Private (activity:read)
 */
router.get(
  "/templates/:id",
  authenticateToken,
  authorize(["activity:read", "activity:manage"]),
  validateActivityTemplateId,
  getActivityTemplateById
);

/**
 * @route   POST /api/activity-templates
 * @desc    Crea nuovo template
 * @access  Private (activity:manage)
 */
router.post(
  "/templates",
  authenticateToken,
  authorize(["activity:manage"]),
  validateCreateActivityTemplate,
  createActivityTemplate
);

/**
 * @route   POST /api/activity-templates/:id/create-activity
 * @desc    Crea activity da template
 * @access  Private (activity:create)
 */
router.post(
  "/templates/:id/create-activity",
  authenticateToken,
  authorize(["activity:create", "activity:manage"]),
  validateActivityTemplateId,
  validateCreateActivityFromTemplate,
  createActivityFromTemplate
);

/**
 * @route   PUT /api/activity-templates/:id
 * @desc    Aggiorna template
 * @access  Private (activity:manage)
 */
router.put(
  "/templates/:id",
  authenticateToken,
  authorize(["activity:manage"]),
  validateActivityTemplateId,
  validateUpdateActivityTemplate,
  updateActivityTemplate
);

/**
 * @route   PATCH /api/activity-templates/:id/toggle-active
 * @desc    Attiva/Disattiva template
 * @access  Private (activity:manage)
 */
router.patch(
  "/templates/:id/toggle-active",
  authenticateToken,
  authorize(["activity:manage"]),
  validateActivityTemplateId,
  toggleTemplateActive
);

/**
 * @route   DELETE /api/activity-templates/:id
 * @desc    Elimina template
 * @access  Private (activity:manage)
 */
router.delete(
  "/templates/:id",
  authenticateToken,
  authorize(["activity:manage"]),
  validateActivityTemplateId,
  deleteActivityTemplate
);

// ============================================================================
// EXPORT
// ============================================================================

export default router;
