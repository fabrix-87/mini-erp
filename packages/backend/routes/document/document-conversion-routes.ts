/**
 * @module document-conversion-routes
 * @description Routes for document conversion operations:
 * clone, convert to another type, and manage document relations.
 */
import { createHonoApp } from "../../lib/hono-app";
import { authenticateToken, authorize } from "../../middleware/auth-middleware";
import {
  validateDocumentId,
  validateConvertDocument,
  validateDuplicateDocument,
} from "../../validators/document-validator";
import {
  cloneDocument,
  convertDocument,
  createDocumentRelation,
  getDocumentRelations,
  deleteDocumentRelation,
} from "../../controllers/document";

const conversionRoutes = createHonoApp();

/**
 * @route POST /api/documents/:id/clone
 * @desc  Clone a document as a new DRAFT with reset status
 * @access Private (document:create)
 */
conversionRoutes.post(
  "/:id/clone",
  authenticateToken,
  authorize(["document:create", "document:manage"]),
  validateDocumentId,
  validateDuplicateDocument,
  cloneDocument,
);

/**
 * @route POST /api/documents/:id/convert
 * @desc  Convert a document to another type (e.g. QUOTE → ORDER)
 * @access Private (document:create)
 */
conversionRoutes.post(
  "/:id/convert",
  authenticateToken,
  authorize(["document:create", "document:manage"]),
  validateDocumentId,
  validateConvertDocument,
  convertDocument,
);

/**
 * @route GET /api/documents/:id/relations
 * @desc  List all relations of a document
 * @access Private (document:read)
 */
conversionRoutes.get(
  "/:id/relations",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  getDocumentRelations,
);

/**
 * @route POST /api/documents/:id/relations
 * @desc  Create a relation between two documents
 * @access Private (document:create)
 */
conversionRoutes.post(
  "/:id/relations",
  authenticateToken,
  authorize(["document:create", "document:manage"]),
  validateDocumentId,
  createDocumentRelation,
);

/**
 * @route DELETE /api/documents/:id/relations/:relationId
 * @desc  Remove a document relation by ID
 * @access Private (document:delete)
 */
conversionRoutes.delete(
  "/:id/relations/:relationId",
  authenticateToken,
  authorize(["document:delete", "document:manage"]),
  validateDocumentId,
  deleteDocumentRelation,
);

export default conversionRoutes;
