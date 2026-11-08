/**
 * @module document-conversion-routes
 * @description Routes for document conversion operations:
 * clone, convert to another type, and manage document relations.
 */
import { createHonoApp } from "../../lib/hono-app";
import { authorize } from "../../middleware/auth-middleware";
import {
  validateDocumentId,
  validateConvertDocument,
  validateCloneDocument,
} from "../../validators/document-validator";
import {
  cloneDocument,
  convertDocument,
  getDocumentRelations,
} from "../../controllers/document";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const conversionRoutes = createHonoApp();
const canCreate = authorize(["document:create", "document:manage"]);

/**
 * @route POST /api/documents/:id/clone
 * @desc  Clone a document as a new DRAFT with reset status
 * @access Private (document:create)
 */
conversionRoutes.post(
  "/:id/clone",
  canCreate,
  requireTenantScope,
  validateDocumentId,
  validateCloneDocument,
  cloneDocument,
);

/**
 * @route POST /api/documents/:id/convert
 * @desc  Convert a document to another type (e.g. QUOTE → ORDER)
 * @access Private (document:create)
 */
conversionRoutes.post(
  "/:id/convert",
  canCreate,
  requireTenantScope,
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
  authorize(["document:read", "document:manage"]),
  requireTenantScope,
  validateDocumentId,
  getDocumentRelations,
);

export default conversionRoutes;
