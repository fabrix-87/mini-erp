import {
  validate,
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
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
// VALIDATION MIDDLEWARE
// ============================================================================

// DOCUMENTS
export const validateCreateDocument = validateBody(
  createDocumentSchema,
  "Document creation",
);

export const validateUpdateDocument = validateBody(
  updateDocumentSchema,
  "Document update",
);

export const validateDocumentId = validateParams(
  documentIdParamSchema,
  "Document ID validation",
);

export const validateDocumentQuery = validate(
  documentQuerySchema,
  "Document query",
);

export const validateUpdateDocumentStatus = validate(
  updateDocumentStatusSchema,
  "Document status update",
);

// DOCUMENT LINES
export const validateDocumentLineId = validateParams(
  documentLineIdParamSchema,
  "Document line ID validation",
);

export const validateAddDocumentLine = validateBody(
  createDocumentLineSchema,
  "Add document line",
);

export const validateUpdateDocumentLine = validateBody(
  updateDocumentLineSchema,
  "Update document line",
);

// CONVERSIONS
export const validateConvertDocument = validateBody(
  convertDocumentSchema,
  "Convert document",
);

export const validateDuplicateDocument = validateBody(
  duplicateDocumentSchema,
  "Duplicate document",
);

// CALCULATIONS
export const validateRecalculateDocument = validateBody(
  recalculateDocumentSchema,
  "Recalculate document",
);

// OTHER PARAMS

export const validateDocumentCustomerIdParam = validateParams(
  documentCustomerIdParamSchema,
  "Customer ID",
);

export const validateDocumentSupplierIdParam = validateParams(
  documentSupplierIdParamSchema,
  "Customer ID",
);

export const validateDocumentAttachmentIdParam = validateParams(
  documentAttachmentIdParamSchema,
  "Customer ID",
);

// INSTALLMENT
export const validateDocumentInstallmentIdParam = validateParams(
  installmentIdParamSchema,
  "Installment ID",
);

export const validateCreateDocumentInstallments = validateBody(
  createInstallmentSchema,
  "Document Installment Creation",
);

export const validateUpdateDocumentInstallments = validateBody(
  updateInstallmentSchema,
  "Update Document Installment",
);

// BULK ACTIONS
export const validateBulkUpdateDocumentsStatus = validateBody(
  bulkUpdateDocumentsStatusSchema,
  "Bulk Update Status Documents",
);

export const validateBulkSendDocuments = validateBody(
  bulkSendDocumentsSchema,
  "Bulk Send Documents",
);

// REPORTS
export const validateTopProductsReportQuery = validateQuery(
  topProductsReportSchema,
  "Top Products Report"
)