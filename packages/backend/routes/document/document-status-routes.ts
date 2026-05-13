/**
 * @module document-status-routes
 * @description Routes for document lifecycle transitions:
 * status update, send, approve, reject, void, and audit history.
 */
import { createHonoApp } from "../../lib/hono-app";
import { authenticateToken, authorize } from "../../middleware/auth-middleware";
import {
  validateDocumentId,
  validateUpdateDocumentStatus,
} from "../../validators/document-validator";
import {
  updateDocumentStatus,
  sendDocument,
  approveDocument,
  rejectDocument,
  voidDocument,
  getDocumentHistory,
} from "../../controllers/document";

const statusRoutes = createHonoApp();

/**
 * @route PATCH /api/documents/:id/status
 * @desc  Update document status
 * @access Private (document:update)
 */
statusRoutes.patch(
  "/:id/status",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateUpdateDocumentStatus,
  updateDocumentStatus,
);

/**
 * @route POST /api/documents/:id/send
 * @desc  Mark document as sent to the customer
 * @access Private (document:update)
 */
statusRoutes.post(
  "/:id/send",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  sendDocument,
);

/**
 * @route POST /api/documents/:id/approve
 * @desc  Approve a document pending approval
 * @access Private (document:update)
 */
statusRoutes.post(
  "/:id/approve",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  approveDocument,
);

/**
 * @route POST /api/documents/:id/reject
 * @desc  Reject a document pending approval
 * @access Private (document:update)
 */
statusRoutes.post(
  "/:id/reject",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  rejectDocument,
);

/**
 * @route POST /api/documents/:id/void
 * @desc  Void (annul) a document
 * @access Private (document:update)
 */
statusRoutes.post(
  "/:id/void",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  voidDocument,
);

/**
 * @route GET /api/documents/:id/history
 * @desc  Retrieve the audit trail of a document
 * @access Private (document:read)
 */
statusRoutes.get(
  "/:id/history",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  getDocumentHistory,
);

export default statusRoutes;
