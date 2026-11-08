/**
 * @module document-conversion-routes
 * @description Routes for creating derived documents (convert to another type, clone) and for
 * reading the relations between documents. Relations are created only by conversion, cloning and
 * fulfillment; they cannot be created or deleted manually.
 */

import { createHonoApp } from "../../lib/hono-app";
import { authorize } from "../../middleware/auth-middleware";
import {
  validateDocumentId,
  validateConvertDocument,
  validateCloneDocument,
} from "../../validators/document-validator";
import { cloneDocument, convertDocument, getDocumentRelations } from "../../controllers/document";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const conversionRoutes = createHonoApp();
const canCreate = authorize(["document:create", "document:manage"]);

/**
 * @route POST /api/documents/:id/clone
 * @desc Clone a document as a new DRAFT of the same type, with the same counterparty
 * @access Private (document:create | document:manage)
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
 * @desc Convert a document into another type as a DRAFT (e.g. QUOTE → ORDER, ORDER → INVOICE)
 * @access Private (document:create | document:manage)
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
 * @access Private (document:read | document:manage)
 */
conversionRoutes.get(
  "/:id/relations",
  authorize(["document:read", "document:manage"]),
  requireTenantScope,
  validateDocumentId,
  getDocumentRelations,
);

export default conversionRoutes;
