/**
 * @module document-crud-routes
 * @description CRUD routes for documents, including filtered list endpoints
 * by type (quotes, orders, invoices, delivery-notes) and by entity (customer, supplier).
 */
import { createHonoApp } from "../../lib/hono-app";
import { authenticateToken, authorize } from "../../middleware/auth-middleware";
import {
  validateCreateDocument,
  validateUpdateDocument,
  validateDocumentId,
  validateDocumentQuery,
  validateRecalculateDocument,
  validateDocumentCustomerIdParam,
  validateDocumentSupplierIdParam,
} from "../../validators/document-validator";
import {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  recalculateDocument,
} from "../../controllers/document";
import { getAllDeliveryNotes, getAllInvoices, getAllOrders, getAllQuotes } from "@/controllers/document/document-crud-controller";

const crudRoutes = createHonoApp();

/**
 * @route GET /api/documents
 * @desc  List all documents with filters and pagination
 * @access Private (document:read)
 */
crudRoutes.get(
  "/",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentQuery,
  getAllDocuments,
);

/**
 * @route GET /api/documents/quotes
 * @desc  List documents of type QUOTE
 * @access Private (document:read)
 */
crudRoutes.get(
  "/quotes",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentQuery,
  getAllQuotes,
);

/**
 * @route GET /api/documents/orders
 * @desc  List documents of type ORDER
 * @access Private (document:read)
 */
crudRoutes.get(
  "/orders",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentQuery,
  getAllOrders,
);

/**
 * @route GET /api/documents/invoices
 * @desc  List documents of type INVOICE
 * @access Private (document:read)
 */
crudRoutes.get(
  "/invoices",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentQuery,
  getAllInvoices,
);

/**
 * @route GET /api/documents/delivery-notes
 * @desc  List documents of type DELIVERY_NOTE
 * @access Private (document:read)
 */
crudRoutes.get(
  "/delivery-notes",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentQuery,
  getAllDeliveryNotes,
);

/**
 * @route GET /api/documents/customer/:customerId
 * @desc  List documents belonging to a specific customer
 * @access Private (document:read)
 */
crudRoutes.get(
  "/customer/:customerId",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentCustomerIdParam,
  getAllDocuments,
);

/**
 * @route GET /api/documents/supplier/:supplierId
 * @desc  List documents belonging to a specific supplier
 * @access Private (document:read)
 */
crudRoutes.get(
  "/supplier/:supplierId",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentSupplierIdParam,
  getAllDocuments,
);

/**
 * @route POST /api/documents
 * @desc  Create a new document
 * @access Private (document:create)
 */
crudRoutes.post(
  "/",
  authenticateToken,
  authorize(["document:create", "document:manage"]),
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
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  getDocumentById,
);

/**
 * @route PUT /api/documents/:id
 * @desc  Update a document by ID
 * @access Private (document:update)
 */
crudRoutes.put(
  "/:id",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
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
  authenticateToken,
  authorize(["document:delete", "document:manage"]),
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
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateRecalculateDocument,
  recalculateDocument,
);

export default crudRoutes;
