/**
 * @module document-bulk-routes
 * @description Routes for batch operations on multiple documents.
 * Registered before parametric routes to avoid :id matching conflicts.
 */
import { createHonoApp } from "../../lib/hono-app";
import { authenticateToken, authorize } from "../../middleware/auth-middleware";
import {
  validateBulkUpdateDocumentsStatus,
  validateBulkSendDocuments,
} from "../../validators/document-validator";
import {
  bulkChangeStatus,
  bulkDeleteDocuments,
  bulkSendDocuments,
  bulkExportDocuments,
} from "../../controllers/document";

const bulkRoutes = createHonoApp();

/**
 * @route POST /api/documents/bulk-change-status
 * @desc  Change status on multiple documents at once
 * @access Private (document:update)
 */
bulkRoutes.post(
  "/bulk-change-status",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateBulkUpdateDocumentsStatus,
  bulkChangeStatus,
);

/**
 * @route POST /api/documents/bulk-delete
 * @desc  Soft-delete multiple documents at once
 * @access Private (document:delete)
 */
bulkRoutes.post(
  "/bulk-delete",
  authenticateToken,
  authorize(["document:delete", "document:manage"]),
  bulkDeleteDocuments,
);

/**
 * @route POST /api/documents/bulk-send
 * @desc  Send multiple documents to their respective customers
 * @access Private (document:update)
 */
bulkRoutes.post(
  "/bulk-send",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateBulkSendDocuments,
  bulkSendDocuments,
);

/**
 * @route POST /api/documents/bulk-export
 * @desc  Export multiple documents as a ZIP archive (PDF or Excel)
 * @access Private (document:read)
 */
bulkRoutes.post(
  "/bulk-export",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  bulkExportDocuments,
);

export default bulkRoutes;
