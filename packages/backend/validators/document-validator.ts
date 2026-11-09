import { validateBody, validateParams, validateQuery } from "../middleware/validation-middleware";
import {
  agingReportSchema,
  approveDocumentSchema,
  bulkDeleteDocumentsSchema,
  bulkUpdateDocumentsStatusSchema,
  cloneDocumentSchema,
  convertDocumentSchema,
  createDocumentLineSchema,
  createDocumentSchema,
  documentAttachmentIdParamSchema,
  documentIdParamSchema,
  documentLineIdParamSchema,
  documentQuerySchema,
  documentStatsSchema,
  generateInstallmentsSchema,
  installmentIdParamSchema,
  overdueInstallmentsQuerySchema,
  payInstallmentSchema,
  rejectDocumentSchema,
  reorderDocumentLinesSchema,
  replaceInstallmentsSchema,
  salesReportSchema,
  topProductsReportSchema,
  updateDocumentSchema,
  updateDocumentStatusSchema,
  voidDocumentSchema,
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

/** Validates the full line payload of a line replacement. Delegates to the shared {@link createDocumentLineSchema}. */
export const validateReplaceDocumentLine = validateBody(
  createDocumentLineSchema,
  "Replace document line",
);

/** Validates the ordered line IDs of a reorder request. Delegates to the shared {@link reorderDocumentLinesSchema}. */
export const validateReorderDocumentLines = validateBody(
  reorderDocumentLinesSchema,
  "Reorder document lines",
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

/** Validates the request body for cloning a document. Delegates to the shared {@link cloneDocumentSchema}. */
export const validateCloneDocument = validateBody(cloneDocumentSchema, "Clone document");

// ============================================================================
// ROUTE PARAMS
// ============================================================================

/**
 * Validates the `:attachmentId` route parameter for document attachment endpoints.
 * Delegates to the shared {@link documentAttachmentIdParamSchema}.
 */
export const validateDocumentAttachmentIdParam = validateParams(
  documentAttachmentIdParamSchema,
  "Attachment ID",
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
 * Validates the request body for generating document installments.
 * Delegates to the shared {@link generateInstallmentsSchema}.
 */
export const validateGenerateDocumentInstallments = validateBody(
  generateInstallmentsSchema,
  "Generate installments",
);

/**
 * Validates the request body for replacing document installments.
 * Delegates to the shared {@link replaceInstallmentsSchema}.
 */
export const validateReplaceDocumentInstallments = validateBody(
  replaceInstallmentsSchema,
  "Replace installments",
);

/**
 * Validates the request body for paying a document installment.
 * Delegates to the shared {@link payInstallmentSchema}.
 */
export const validatePayDocumentInstallment = validateBody(payInstallmentSchema, "Pay installment");

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
 * Validates the request body for a bulk soft-delete of documents.
 * Delegates to the shared {@link bulkDeleteDocumentsSchema}.
 */
export const validateBulkDeleteDocuments = validateBody(
  bulkDeleteDocumentsSchema,
  "Bulk Delete Documents",
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

// ============================================================================
// STATUS ACTIONS
// ============================================================================
export const validateApproveDocument = validateBody(approveDocumentSchema, "Approve document");
export const validateRejectDocument = validateBody(rejectDocumentSchema, "Reject document");
export const validateVoidDocument = validateBody(voidDocumentSchema, "Void document");

// ============================================================================
// STATS
// ============================================================================

export const validateDocumentStatsQuery = validateQuery(documentStatsSchema, "Document Stats");
export const validateSalesReportQuery = validateQuery(salesReportSchema, "Sales Report");
export const validateAgingReportQuery = validateQuery(agingReportSchema, "Aging Report");
export const validateOverdueInstallmentsQuery = validateQuery(
  overdueInstallmentsQuerySchema,
  "Overdue Installments",
);
