import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation-middleware";
import {
  bulkSendDocumentsSchema,
  bulkUpdateDocumentsStatusSchema,
  convertDocumentSchema,
  createDocumentLineSchema,
  createDocumentSchema,
  createInstallmentSchema,
  documentAttachmentIdParamSchema,
  documentCustomerIdParamSchema,
  documentIdParamSchema,
  documentLineIdParamSchema,
  documentQuerySchema,
  documentSupplierIdParamSchema,
  duplicateDocumentSchema,
  installmentIdParamSchema,
  recalculateDocumentSchema,
  topProductsReportSchema,
  updateDocumentLineSchema,
  updateDocumentSchema,
  updateDocumentStatusSchema,
  updateInstallmentSchema,
} from "@mini-erp/shared/validators/document";

// ============================================================================
// DOCUMENTS
// ============================================================================

/**
 * Validates the request body for document creation.
 * Delegates to the shared {@link createDocumentSchema}.
 */
export const validateCreateDocument = validateBody(createDocumentSchema, "Document creation");

/**
 * Validates the request body for document update.
 * Delegates to the shared {@link updateDocumentSchema}.
 */
export const validateUpdateDocument = validateBody(updateDocumentSchema, "Document update");

/**
 * Validates the `:id` route parameter as a valid document ID.
 * Delegates to the shared {@link documentIdParamSchema}.
 */
export const validateDocumentId = validateParams(documentIdParamSchema, "Document ID validation");

/**
 * Validates query string parameters for document list endpoints
 * (pagination, filters, sorting).
 * Delegates to the shared {@link documentQuerySchema}.
 */
export const validateDocumentQuery = validateQuery(documentQuerySchema, "Document query");

/**
 * Validates the request body for a document status transition.
 * Delegates to the shared {@link updateDocumentStatusSchema}.
 */
export const validateUpdateDocumentStatus = validateBody(
  updateDocumentStatusSchema,
  "Document status update",
);

// ============================================================================
// DOCUMENT LINES
// ============================================================================

/**
 * Validates the `:lineId` route parameter as a valid document line ID.
 * Delegates to the shared {@link documentLineIdParamSchema}.
 */
export const validateDocumentLineId = validateParams(
  documentLineIdParamSchema,
  "Document line ID validation",
);

/**
 * Validates the request body for adding a new line to a document.
 * Delegates to the shared {@link createDocumentLineSchema}.
 */
export const validateAddDocumentLine = validateBody(createDocumentLineSchema, "Add document line");

/**
 * Validates the request body for updating an existing document line.
 * Delegates to the shared {@link updateDocumentLineSchema}.
 */
export const validateUpdateDocumentLine = validateBody(
  updateDocumentLineSchema,
  "Update document line",
);

// ============================================================================
// CONVERSIONS
// ============================================================================

/**
 * Validates the request body for converting a document to a different type
 * (e.g. QUOTE → ORDER, ORDER → INVOICE).
 * Delegates to the shared {@link convertDocumentSchema}.
 */
export const validateConvertDocument = validateBody(convertDocumentSchema, "Convert document");

/**
 * Validates the request body for cloning/duplicating a document.
 * Delegates to the shared {@link duplicateDocumentSchema}.
 */
export const validateDuplicateDocument = validateBody(
  duplicateDocumentSchema,
  "Duplicate document",
);

// ============================================================================
// CALCULATIONS
// ============================================================================

/**
 * Validates the request body for a document recalculation request.
 * Delegates to the shared {@link recalculateDocumentSchema}.
 */
export const validateRecalculateDocument = validateBody(
  recalculateDocumentSchema,
  "Recalculate document",
);

// ============================================================================
// ROUTE PARAMS
// ============================================================================

/**
 * Validates the `:customerId` route parameter for customer-scoped document endpoints.
 * Delegates to the shared {@link documentCustomerIdParamSchema}.
 */
export const validateDocumentCustomerIdParam = validateParams(
  documentCustomerIdParamSchema,
  "Customer ID",
);

/**
 * Validates the `:supplierId` route parameter for supplier-scoped document endpoints.
 * Delegates to the shared {@link documentSupplierIdParamSchema}.
 */
export const validateDocumentSupplierIdParam = validateParams(
  documentSupplierIdParamSchema,
  "Supplier ID", // ← fix del bug #3 del validator
);

/**
 * Validates the `:attachmentId` route parameter for document attachment endpoints.
 * Delegates to the shared {@link documentAttachmentIdParamSchema}.
 */
export const validateDocumentAttachmentIdParam = validateParams(
  documentAttachmentIdParamSchema,
  "Attachment ID", // ← fix del bug #3 del validator
);

// ============================================================================
// INSTALLMENTS
// ============================================================================

/**
 * Validates the `:installmentId` route parameter for payment installment endpoints.
 * Delegates to the shared {@link installmentIdParamSchema}.
 */
export const validateDocumentInstallmentIdParam = validateParams(
  installmentIdParamSchema,
  "Installment ID",
);

/**
 * Validates the request body for creating a new payment installment on a document.
 * Delegates to the shared {@link createInstallmentSchema}.
 */
export const validateCreateDocumentInstallments = validateBody(
  createInstallmentSchema,
  "Document Installment Creation",
);

/**
 * Validates the request body for updating an existing payment installment.
 * Delegates to the shared {@link updateInstallmentSchema}.
 */
export const validateUpdateDocumentInstallments = validateBody(
  updateInstallmentSchema,
  "Update Document Installment",
);

// ============================================================================
// BULK ACTIONS
// ============================================================================

/**
 * Validates the request body for a bulk status update on multiple documents.
 * Delegates to the shared {@link bulkUpdateDocumentsStatusSchema}.
 */
export const validateBulkUpdateDocumentsStatus = validateBody(
  bulkUpdateDocumentsStatusSchema,
  "Bulk Update Status Documents",
);

/**
 * Validates the request body for a bulk send operation on multiple documents.
 * Delegates to the shared {@link bulkSendDocumentsSchema}.
 */
export const validateBulkSendDocuments = validateBody(
  bulkSendDocumentsSchema,
  "Bulk Send Documents",
);

// ============================================================================
// REPORTS
// ============================================================================

/**
 * Validates query string parameters for the top-products report endpoint.
 * Delegates to the shared {@link topProductsReportSchema}.
 */
export const validateTopProductsReportQuery = validateQuery(
  topProductsReportSchema,
  "Top Products Report",
);
