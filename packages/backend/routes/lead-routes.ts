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
} from "../validators/lead-validator";
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
} from "../controllers/lead-controller";
import { authorize } from "@/middleware/auth-middleware";
import { createHonoApp } from "@/lib/hono-app";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const leadRoutes = createHonoApp();

// ============================================================================
// STATS (before :id to avoid param conflicts)
// ============================================================================

/**
 * @route  GET /api/leads/stats
 * @access Private (lead:read)
 */
leadRoutes.get(
  "/stats",
  requireTenantScope,
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
leadRoutes.post(
  "/bulk/assign",
  requireTenantScope,
  authorize(["lead:update", "lead:manage"]),
  validateBulkAssignLeads,
  bulkAssignLeads,
);

/**
 * @route  POST /api/leads/bulk/status
 * @access Private (lead:update)
 */
leadRoutes.post(
  "/bulk/status",
  requireTenantScope,
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
leadRoutes.get(
  "/",
  requireTenantScope,
  authorize(["lead:read", "lead:manage"]),
  validateLeadQuery,
  getAllLeads,
);

/**
 * @route  POST /api/leads
 * @access Private (lead:create)
 */
leadRoutes.post(
  "/",
  requireTenantScope,
  authorize(["lead:create", "lead:manage"]),
  validateCreateLead,
  createLead,
);

/**
 * @route  GET /api/leads/:id
 * @access Private (lead:read)
 */
leadRoutes.get(
  "/:id",
  requireTenantScope,
  authorize(["lead:read", "lead:manage"]),
  validateLeadId,
  getLeadById,
);

/**
 * @route  PUT /api/leads/:id
 * @access Private (lead:update)
 */
leadRoutes.put(
  "/:id",
  requireTenantScope,
  authorize(["lead:update", "lead:manage"]),
  validateLeadId,
  validateUpdateLead,
  updateLead,
);

/**
 * @route  PATCH /api/leads/:id/status
 * @access Private (lead:update)
 */
leadRoutes.patch(
  "/:id/status",
  requireTenantScope,
  authorize(["lead:update", "lead:manage"]),
  validateLeadId,
  validateUpdateLeadStatus,
  updateLeadStatus,
);

/**
 * @route  PATCH /api/leads/:id/score
 * @access Private (lead:update)
 */
leadRoutes.patch(
  "/:id/score",
  requireTenantScope,
  authorize(["lead:update", "lead:manage"]),
  validateLeadId,
  validateUpdateLeadScore,
  updateLeadScore,
);

/**
 * @route  PATCH /api/leads/:id/qualify
 * @access Private (lead:update)
 */
leadRoutes.patch(
  "/:id/qualify",
  requireTenantScope,
  authorize(["lead:update", "lead:manage"]),
  validateLeadId,
  validateQualifyLead,
  qualifyLead,
);

/**
 * @route  POST /api/leads/:id/convert
 * @access Private (lead:convert)
 */
leadRoutes.post(
  "/:id/convert",
  requireTenantScope,
  authorize(["lead:convert", "lead:manage"]),
  validateLeadId,
  validateConvertLead,
  convertLead,
);

/**
 * @route  PATCH /api/leads/:id/assign
 * @access Private (lead:update)
 */
leadRoutes.patch(
  "/:id/assign",
  requireTenantScope,
  authorize(["lead:update", "lead:manage"]),
  validateLeadId,
  validateUpdateLead,
  assignLead,
);

/**
 * @route  DELETE /api/leads/:id
 * @access Private (lead:delete)
 */
leadRoutes.delete(
  "/:id",
  requireTenantScope,
  authorize(["lead:delete", "lead:manage"]),
  validateLeadId,
  deleteLead,
);

export default leadRoutes;
