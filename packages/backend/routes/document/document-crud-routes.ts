/**
 * @module document-crud-routes
 * @description CRUD routes for documents, including filtered list endpoints
 * by type (quotes, orders, invoices, delivery-notes) and by entity (customer, supplier).
 */
import { createHonoApp } from "../../lib/hono-app";
import { authorize } from "../../middleware/auth-middleware";
import {
  validateCreateDocument,
  validateUpdateDocument,
  validateDocumentId,
  validateDocumentQuery,
} from "../../validators/document-validator";
import {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  recalculateDocument,
} from "../../controllers/document";

import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const crudRoutes = createHonoApp();

/**
 * @route GET /api/documents
 * @desc  List all documents with filters and pagination
 * @access Private (document:read)
 */
crudRoutes.get(
  "/",
  authorize(["document:read", "document:manage"]),
  requireTenantScope,
  validateDocumentQuery,
  getAllDocuments,
);

/**
 * @route POST /api/documents
 * @desc  Create a new document
 * @access Private (document:create)
 */
crudRoutes.post(
  "/",
  authorize(["document:create", "document:manage"]),
  requireTenantScope,
  validateCreateDocument,
  createDocument,
);

/**
 * @route GET /api/documents/:id
 * @desc  Get a document by ID
 * @access Private (document:read)
 */
crudRoutes.get(
  "/:id",
  authorize(["document:read", "document:manage"]),
  requireTenantScope,
  validateDocumentId,
  getDocumentById,
);

/**
 * @route PATCH /api/documents/:id
 * @desc  Update a document by ID
 * @access Private (document:update)
 */
crudRoutes.patch(
  "/:id",
  authorize(["document:update", "document:manage"]),
  requireTenantScope,
  validateDocumentId,
  validateUpdateDocument,
  updateDocument,
);

/**
 * @route DELETE /api/documents/:id
 * @desc  Soft-delete a document by ID
 * @access Private (document:delete)
 */
crudRoutes.delete(
  "/:id",
  authorize(["document:delete", "document:manage"]),
  requireTenantScope,
  validateDocumentId,
  deleteDocument,
);

/**
 * @route POST /api/documents/:id/recalculate
 * @desc  Recalculate document totals from current lines
 * @access Private (document:update)
 */
crudRoutes.post(
  "/:id/recalculate",
  authorize(["document:update", "document:manage"]),
  requireTenantScope,
  validateDocumentId,
  recalculateDocument,
);

export default crudRoutes;
