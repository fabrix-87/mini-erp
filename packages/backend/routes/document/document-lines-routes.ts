/**
 * @module document-lines-routes
 * @description Routes for document line management:
 * list, get by ID, add, bulk-add, update, delete, reorder.
 * Static sub-paths (/bulk, /reorder) are registered before /:lineId.
 */
import { createHonoApp } from "../../lib/hono-app";
import { authorize } from "../../middleware/auth-middleware";
import {
  validateAddDocumentLine,
  validateDocumentId,
  validateDocumentLineId,
  validateReorderDocumentLines,
  validateReplaceDocumentLine,
} from "../../validators/document-validator";
import {
  addDocumentLine,
  updateDocumentLine,
  deleteDocumentLine,
  reorderDocumentLines,
} from "../../controllers/document";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const linesRoutes = createHonoApp();
const canUpdate = authorize(["document:update", "document:manage"]);

/**
 * @route PATCH /api/documents/:id/lines/reorder
 * @desc  Reorder document lines by providing an ordered array of line IDs
 * @access Private (document:update)
 */
linesRoutes.patch(
  "/:id/lines/reorder",
  canUpdate,
  requireTenantScope,
  validateDocumentId,
  validateReorderDocumentLines,
  reorderDocumentLines,
);

/**
 * @route POST /api/documents/:id/lines
 * @desc  Add a single line to a document
 * @access Private (document:update)
 */
linesRoutes.post(
  "/:id/lines",
  canUpdate,
  requireTenantScope,
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
  canUpdate,
  requireTenantScope,
  validateDocumentLineId,
  validateReplaceDocumentLine,
  updateDocumentLine,
);

/**
 * @route DELETE /api/documents/:id/lines/:lineId
 * @desc  Delete a document line by ID
 * @access Private (document:update)
 */
linesRoutes.delete(
  "/:id/lines/:lineId",
  canUpdate,
  requireTenantScope,
  validateDocumentLineId,
  deleteDocumentLine,
);

export default linesRoutes;
