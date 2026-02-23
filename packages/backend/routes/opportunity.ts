import express from "express";
import { authenticateToken, authorize } from "../middleware/auth";
import {
  validateOpportunityId,
  validateCustomerIdParam,
  validateClosedReasonId,
  validateOpportunityQuery,
  validateOpportunityStats,
  validateSalesFunnelQuery,
  validateClosedReasonQuery,
  validateCreateOpportunity,
  validateUpdateOpportunity,
  validateUpdateOpportunityStage,
  validateUpdateOpportunityStatus,
  validateWinOpportunity,
  validateLoseOpportunity,
  validateBulkAssignOpportunities,
  validateBulkUpdateStage,
  validateCreateClosedReason,
  validateUpdateClosedReason,
} from "../validators/opportunity";
import {
  getAllOpportunities,
  getOpportunitiesByCustomer,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  updateStage,
  updateOpportunityStatus,
  closeOpportunityWon,
  closeOpportunityLost,
  assignOpportunity,
  bulkAssignOpportunities,
  bulkUpdateStage,
  deleteOpportunity,
  getPipelineStats,
  getSalesFunnel,
  getAllClosedReasons,
  createClosedReason,
  updateClosedReason,
  deleteClosedReason,
} from "../controllers/opportunity";

const router = express.Router();

// ============================================================================
// STATS (before :id to avoid param conflicts)
// ============================================================================

/**
 * @route  GET /api/opportunities/stats/pipeline
 * @access Private (opportunity:read)
 */
router.get(
  "/stats/pipeline",
  authenticateToken,
  authorize(["opportunity:read", "opportunity:manage"]),
  validateOpportunityStats,
  getPipelineStats,
);

/**
 * @route  GET /api/opportunities/stats/funnel
 * @access Private (opportunity:read)
 */
router.get(
  "/stats/funnel",
  authenticateToken,
  authorize(["opportunity:read", "opportunity:manage"]),
  validateSalesFunnelQuery,
  getSalesFunnel,
);

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * @route  POST /api/opportunities/bulk/assign
 * @access Private (opportunity:update)
 */
router.post(
  "/bulk/assign",
  authenticateToken,
  authorize(["opportunity:update", "opportunity:manage"]),
  validateBulkAssignOpportunities,
  bulkAssignOpportunities,
);

/**
 * @route  POST /api/opportunities/bulk/stage
 * @access Private (opportunity:update)
 */
router.post(
  "/bulk/stage",
  authenticateToken,
  authorize(["opportunity:update", "opportunity:manage"]),
  validateBulkUpdateStage,
  bulkUpdateStage,
);

// ============================================================================
// CLOSED REASONS
// ============================================================================

/**
 * @route  GET /api/opportunities/closed-reasons
 * @access Private (opportunity:read)
 */
router.get(
  "/closed-reasons",
  authenticateToken,
  authorize(["opportunity:read", "opportunity:manage"]),
  validateClosedReasonQuery,
  getAllClosedReasons,
);

/**
 * @route  POST /api/opportunities/closed-reasons
 * @access Private (opportunity:manage)
 */
router.post(
  "/closed-reasons",
  authenticateToken,
  authorize(["opportunity:manage"]),
  validateCreateClosedReason,
  createClosedReason,
);

/**
 * @route  PUT /api/opportunities/closed-reasons/:id
 * @access Private (opportunity:manage)
 */
router.put(
  "/closed-reasons/:id",
  authenticateToken,
  authorize(["opportunity:manage"]),
  validateClosedReasonId,
  validateUpdateClosedReason,
  updateClosedReason,
);

/**
 * @route  DELETE /api/opportunities/closed-reasons/:id
 * @access Private (opportunity:manage)
 */
router.delete(
  "/closed-reasons/:id",
  authenticateToken,
  authorize(["opportunity:manage"]),
  validateClosedReasonId,
  deleteClosedReason,
);

// ============================================================================
// CUSTOMER SUB-RESOURCE
// ============================================================================

/**
 * @route  GET /api/opportunities/customer/:customerId
 * @access Private (opportunity:read)
 */
router.get(
  "/customer/:customerId",
  authenticateToken,
  authorize(["opportunity:read", "opportunity:manage"]),
  validateCustomerIdParam,
  validateOpportunityQuery,
  getOpportunitiesByCustomer,
);

// ============================================================================
// CRUD
// ============================================================================

/**
 * @route  GET /api/opportunities
 * @access Private (opportunity:read)
 */
router.get(
  "/",
  authenticateToken,
  authorize(["opportunity:read", "opportunity:manage"]),
  validateOpportunityQuery,
  getAllOpportunities,
);

/**
 * @route  POST /api/opportunities
 * @access Private (opportunity:create)
 */
router.post(
  "/",
  authenticateToken,
  authorize(["opportunity:create", "opportunity:manage"]),
  validateCreateOpportunity,
  createOpportunity,
);

/**
 * @route  GET /api/opportunities/:id
 * @access Private (opportunity:read)
 */
router.get(
  "/:id",
  authenticateToken,
  authorize(["opportunity:read", "opportunity:manage"]),
  validateOpportunityId,
  getOpportunityById,
);

/**
 * @route  PUT /api/opportunities/:id
 * @access Private (opportunity:update)
 */
router.put(
  "/:id",
  authenticateToken,
  authorize(["opportunity:update", "opportunity:manage"]),
  validateOpportunityId,
  validateUpdateOpportunity,
  updateOpportunity,
);

/**
 * @route  PATCH /api/opportunities/:id/stage
 * @access Private (opportunity:update)
 */
router.patch(
  "/:id/stage",
  authenticateToken,
  authorize(["opportunity:update", "opportunity:manage"]),
  validateOpportunityId,
  validateUpdateOpportunityStage,
  updateStage,
);

/**
 * @route  PATCH /api/opportunities/:id/status
 * @access Private (opportunity:update)
 */
router.patch(
  "/:id/status",
  authenticateToken,
  authorize(["opportunity:update", "opportunity:manage"]),
  validateOpportunityId,
  validateUpdateOpportunityStatus,
  updateOpportunityStatus,
);

/**
 * @route  PATCH /api/opportunities/:id/close-won
 * @access Private (opportunity:update)
 */
router.patch(
  "/:id/close-won",
  authenticateToken,
  authorize(["opportunity:update", "opportunity:manage"]),
  validateOpportunityId,
  validateWinOpportunity,
  closeOpportunityWon,
);

/**
 * @route  PATCH /api/opportunities/:id/close-lost
 * @access Private (opportunity:update)
 */
router.patch(
  "/:id/close-lost",
  authenticateToken,
  authorize(["opportunity:update", "opportunity:manage"]),
  validateOpportunityId,
  validateLoseOpportunity,
  closeOpportunityLost,
);

/**
 * @route  PATCH /api/opportunities/:id/assign
 * @access Private (opportunity:update)
 */
router.patch(
  "/:id/assign",
  authenticateToken,
  authorize(["opportunity:update", "opportunity:manage"]),
  validateOpportunityId,
  validateUpdateOpportunity,
  assignOpportunity,
);

/**
 * @route  DELETE /api/opportunities/:id
 * @access Private (opportunity:delete)
 */
router.delete(
  "/:id",
  authenticateToken,
  authorize(["opportunity:delete", "opportunity:manage"]),
  validateOpportunityId,
  deleteOpportunity,
);

export default router;
