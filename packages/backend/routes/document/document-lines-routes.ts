/**
 * @module document-lines-routes
 * @description Routes for document line management:
 * list, get by ID, add, bulk-add, update, delete, reorder.
 * Static sub-paths (/bulk, /reorder) are registered before /:lineId.
 */
import { createHonoApp } from "../../lib/hono-app";
import { authorize } from "../../middleware/auth-middleware";
import {
  validateDocumentId,
  validateDocumentLineId,
  validateAddDocumentLine,
  validateUpdateDocumentLine,
} from "../../validators/document-validator";
import {
  getDocumentLines,
  getDocumentLineById,
  addDocumentLine,
  updateDocumentLine,
  deleteDocumentLine,
  reorderDocumentLines,
} from "../../controllers/document";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const linesRoutes = createHonoApp();

/**
 * @route GET /api/documents/:id/lines
 * @desc  List all lines of a document ordered by lineNumber
 * @access Private (document:read)
 */
linesRoutes.get(
  "/:id/lines",
  requireTenantScope,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  getDocumentLines,
);

/**
 * @route PATCH /api/documents/:id/lines/reorder
 * @desc  Reorder document lines by providing an ordered array of line IDs
 * @access Private (document:update)
 */
linesRoutes.patch(
  "/:id/lines/reorder",
  requireTenantScope,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  reorderDocumentLines,
);

/**
 * @route GET /api/documents/:id/lines/:lineId
 * @desc  Get a single document line by ID
 * @access Private (document:read)
 */
linesRoutes.get(
  "/:id/lines/:lineId",
  requireTenantScope,
  authorize(["document:read", "document:manage"]),
  validateDocumentLineId,
  getDocumentLineById,
);

/**
 * @route POST /api/documents/:id/lines
 * @desc  Add a single line to a document
 * @access Private (document:update)
 */
linesRoutes.post(
  "/:id/lines",
  requireTenantScope,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateAddDocumentLine,
  addDocumentLine,
);

/**
 * @route PUT /api/documents/:id/lines/:lineId
 * @desc  Update a document line, recalculating totals if pricing fields change
 * @access Private (document:update)
 */
linesRoutes.put(
  "/:id/lines/:lineId",
  requireTenantScope,
  authorize(["document:update", "document:manage"]),
  validateDocumentLineId,
  validateUpdateDocumentLine,
  updateDocumentLine,
);

/**
 * @route DELETE /api/documents/:id/lines/:lineId
 * @desc  Delete a document line by ID
 * @access Private (document:update)
 */
linesRoutes.delete(
  "/:id/lines/:lineId",
  requireTenantScope,
  authorize(["document:update", "document:manage"]),
  validateDocumentLineId,
  deleteDocumentLine,
);

export default linesRoutes;
