/**
 * @module document-bulk-routes
 * @description Routes for batch operations on multiple documents.
 * Registered before parametric routes to avoid :id matching conflicts.
 */
import { createHonoApp } from "../../lib/hono-app";
import { authorize } from "../../middleware/auth-middleware";
import {
  validateBulkDeleteDocuments,
  validateBulkUpdateDocumentsStatus,
} from "../../validators/document-validator";
import {
  bulkChangeStatus,
  bulkDeleteDocuments,
} from "../../controllers/document";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const bulkRoutes = createHonoApp();

/**
 * @route POST /api/documents/bulk-change-status
 * @desc  Change status on multiple documents, each through the regular transition rules
 * @access Private (document:update | document:manage)
 */
bulkRoutes.post(
  "/bulk-change-status",
  authorize(["document:update", "document:manage"]),
  requireTenantScope,
  validateBulkUpdateDocumentsStatus,
  bulkChangeStatus,
);

/**
 * @route POST /api/documents/bulk-delete
 * @desc  Soft-delete multiple draft documents without a number
 * @access Private (document:delete | document:manage)
 */
bulkRoutes.post(
  "/bulk-delete",
  authorize(["document:delete", "document:manage"]),
  requireTenantScope,
  validateBulkDeleteDocuments,
  bulkDeleteDocuments,
);

export default bulkRoutes;
