/**
 * @module document-status-routes
 * @description Routes for document lifecycle transitions:
 * status update, send, approve, reject, void, and audit history.
 */
import { createHonoApp } from "../../lib/hono-app";
import { authorize } from "../../middleware/auth-middleware";
import {
  validateApproveDocument,
  validateDocumentId,
  validateRejectDocument,
  validateUpdateDocumentStatus,
  validateVoidDocument,
} from "../../validators/document-validator";
import {
  updateDocumentStatus,
  sendDocument,
  approveDocument,
  rejectDocument,
  voidDocument,
  getDocumentHistory,
} from "../../controllers/document";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const statusRoutes = createHonoApp();
const canUpdate = authorize(["document:update", "document:manage"]);
const canApprove = authorize(["document:approve", "document:manage"]);
const canVoid = authorize(["document:void", "document:manage"]);

/**
 * @route PATCH /api/documents/:id/status
 * @desc  Update document status
 * @access Private (document:update | document:manage)
 */
statusRoutes.patch(
  "/:id/status",
  canUpdate,
  requireTenantScope,
  validateDocumentId,
  validateUpdateDocumentStatus,
  updateDocumentStatus,
);

/**
 * @route POST /api/documents/:id/send
 * @desc  Mark document as sent to the customer
 * @access Private (document:update | document:manage)
 */
statusRoutes.post("/:id/send", canUpdate, requireTenantScope, validateDocumentId, sendDocument);

/**
 * @route POST /api/documents/:id/approve
 * @desc  Approve a document pending approval
 * @access Private (document:approve | document:manage)
 */
statusRoutes.post(
  "/:id/approve",
  canApprove,
  requireTenantScope,
  validateDocumentId,
  validateApproveDocument,
  approveDocument,
);

/**
 * @route POST /api/documents/:id/reject
 * @desc  Reject a document pending approval
 * @access Private (document:approve | document:manage)
 */
statusRoutes.post(
  "/:id/reject",
  canApprove,
  requireTenantScope,
  validateDocumentId,
  validateRejectDocument,
  rejectDocument,
);

/**
 * @route POST /api/documents/:id/void
 * @desc  Void (annul) a document
 * @access Private (document:void | document:manage)
 */
statusRoutes.post(
  "/:id/void",
  canVoid,
  requireTenantScope,
  validateDocumentId,
  validateVoidDocument,
  voidDocument,
);

/**
 * @route GET /api/documents/:id/history
 * @desc  Retrieve the audit trail of a document
 * @access Private (document:read | document:manage)
 */
statusRoutes.get(
  "/:id/history",
  authorize(["document:read", "document:manage"]),
  requireTenantScope,
  validateDocumentId,
  getDocumentHistory,
);

export default statusRoutes;
