import express from "express";
import { authenticateToken, authorize } from "../middleware/auth";
import {
  validateLeadId,
  validateLeadQuery,
  validateLeadStats,
  validateCreateLead,
  validateUpdateLead,
  validateUpdateLeadStatus,
  validateUpdateLeadScore,
  validateQualifyLead,
  validateConvertLead,
  validateBulkAssignLeads,
  validateBulkUpdateLeadStatus,
} from "../validators/lead";
import {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  updateLeadScore,
  qualifyLead,
  convertLead,
  assignLead,
  bulkAssignLeads,
  bulkUpdateLeadStatus,
  deleteLead,
  getLeadStats,
} from "../controllers/lead";

const router = express.Router();

// ============================================================================
// STATS (before :id to avoid param conflicts)
// ============================================================================

/**
 * @route  GET /api/leads/stats
 * @access Private (lead:read)
 */
router.get(
  "/stats",
  authenticateToken,
  authorize(["lead:read", "lead:manage"]),
  validateLeadStats,
  getLeadStats,
);

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * @route  POST /api/leads/bulk/assign
 * @access Private (lead:update)
 */
router.post(
  "/bulk/assign",
  authenticateToken,
  authorize(["lead:update", "lead:manage"]),
  validateBulkAssignLeads,
  bulkAssignLeads,
);

/**
 * @route  POST /api/leads/bulk/status
 * @access Private (lead:update)
 */
router.post(
  "/bulk/status",
  authenticateToken,
  authorize(["lead:update", "lead:manage"]),
  validateBulkUpdateLeadStatus,
  bulkUpdateLeadStatus,
);

// ============================================================================
// CRUD
// ============================================================================

/**
 * @route  GET /api/leads
 * @access Private (lead:read)
 */
router.get(
  "/",
  authenticateToken,
  authorize(["lead:read", "lead:manage"]),
  validateLeadQuery,
  getAllLeads,
);

/**
 * @route  POST /api/leads
 * @access Private (lead:create)
 */
router.post(
  "/",
  authenticateToken,
  authorize(["lead:create", "lead:manage"]),
  validateCreateLead,
  createLead,
);

/**
 * @route  GET /api/leads/:id
 * @access Private (lead:read)
 */
router.get(
  "/:id",
  authenticateToken,
  authorize(["lead:read", "lead:manage"]),
  validateLeadId,
  getLeadById,
);

/**
 * @route  PUT /api/leads/:id
 * @access Private (lead:update)
 */
router.put(
  "/:id",
  authenticateToken,
  authorize(["lead:update", "lead:manage"]),
  validateLeadId,
  validateUpdateLead,
  updateLead,
);

/**
 * @route  PATCH /api/leads/:id/status
 * @access Private (lead:update)
 */
router.patch(
  "/:id/status",
  authenticateToken,
  authorize(["lead:update", "lead:manage"]),
  validateLeadId,
  validateUpdateLeadStatus,
  updateLeadStatus,
);

/**
 * @route  PATCH /api/leads/:id/score
 * @access Private (lead:update)
 */
router.patch(
  "/:id/score",
  authenticateToken,
  authorize(["lead:update", "lead:manage"]),
  validateLeadId,
  validateUpdateLeadScore,
  updateLeadScore,
);

/**
 * @route  PATCH /api/leads/:id/qualify
 * @access Private (lead:update)
 */
router.patch(
  "/:id/qualify",
  authenticateToken,
  authorize(["lead:update", "lead:manage"]),
  validateLeadId,
  validateQualifyLead,
  qualifyLead,
);

/**
 * @route  POST /api/leads/:id/convert
 * @access Private (lead:convert)
 */
router.post(
  "/:id/convert",
  authenticateToken,
  authorize(["lead:convert", "lead:manage"]),
  validateLeadId,
  validateConvertLead,
  convertLead,
);

/**
 * @route  PATCH /api/leads/:id/assign
 * @access Private (lead:update)
 */
router.patch(
  "/:id/assign",
  authenticateToken,
  authorize(["lead:update", "lead:manage"]),
  validateLeadId,
  validateUpdateLead,
  assignLead,
);

/**
 * @route  DELETE /api/leads/:id
 * @access Private (lead:delete)
 */
router.delete(
  "/:id",
  authenticateToken,
  authorize(["lead:delete", "lead:manage"]),
  validateLeadId,
  deleteLead,
);

export default router;
