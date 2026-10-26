import { z } from "zod";
import {
  agingReportSchema,
  approveDocumentSchema,
  bulkDeleteDocumentsSchema,
  bulkSendDocumentsSchema,
  bulkUpdateDocumentsStatusSchema,
  cloneDocumentSchema,
  convertDocumentSchema,
  createDocumentLineSchema,
  createDocumentRelationSchema,
  createDocumentSchema,
  createInstallmentSchema,
  documentAttachmentIdParamSchema,
  documentCustomerIdParamSchema,
  documentIdParamSchema,
  documentLineIdParamSchema,
  documentLineQuerySchema,
  documentQuerySchema,
  documentStatsSchema,
  documentSupplierIdParamSchema,
  generateInstallmentPlanSchema,
  installmentIdParamSchema,
  installmentQuerySchema,
  payInstallmentSchema,
  quantityDeliveredSchema,
  rejectDocumentSchema,
  salesReportSchema,
  sendDocumentSchema,
  topProductsReportSchema,
  updateDocumentLineSchema,
  updateDocumentSchema,
  updateDocumentStatusSchema,
  updateInstallmentSchema,
  voidDocumentSchema,
} from "../../validators/document";

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateDocumentLineInput = z.infer<typeof createDocumentLineSchema>;
export type UpdateDocumentLineInput = z.infer<typeof updateDocumentLineSchema>;
export type UpdateLineDeliveredQuantity = z.infer<typeof quantityDeliveredSchema>;

export type CreateInstallmentInput = z.infer<typeof createInstallmentSchema>;
export type UpdateInstallmentInput = z.infer<typeof updateInstallmentSchema>;
export type PayInstallmentInput = z.infer<typeof payInstallmentSchema>;
export type GenerateInstallmentPlanInput = z.infer<typeof generateInstallmentPlanSchema>;

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type UpdateDocumentStatusInput = z.infer<typeof updateDocumentStatusSchema>;
export type ApproveDocumentInput = z.infer<typeof approveDocumentSchema>;
export type RejectDocumentInput = z.infer<typeof rejectDocumentSchema>;
export type SendDocumentInput = z.infer<typeof sendDocumentSchema>;
export type ConvertDocumentInput = z.infer<typeof convertDocumentSchema>;
export type CloneDocumentInput = z.infer<typeof cloneDocumentSchema>;

export type CreateDocumentRelationInput = z.infer<typeof createDocumentRelationSchema>;

export type BulkUpdateDocumentsStatusInput = z.infer<typeof bulkUpdateDocumentsStatusSchema>;
export type BulkDeleteDocumentsInput = z.infer<typeof bulkDeleteDocumentsSchema>;
export type BulkSendDocumentsInput = z.infer<typeof bulkSendDocumentsSchema>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type DocumentQueryInput = z.infer<typeof documentQuerySchema>;
export type DocumentLineQueryInput = z.infer<typeof documentLineQuerySchema>;
export type InstallmentQueryInput = z.infer<typeof installmentQuerySchema>;
export type DocumentStatsInput = z.infer<typeof documentStatsSchema>;
export type SalesReportInput = z.infer<typeof salesReportSchema>;
export type AgingReportInput = z.infer<typeof agingReportSchema>;
export type TopProductsReportInput = z.infer<typeof topProductsReportSchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type DocumentIdParam = z.infer<typeof documentIdParamSchema>;
export type DocumentLineIdParam = DocumentIdParam & z.infer<typeof documentLineIdParamSchema>;
export type InstallmentIdParam = DocumentIdParam & z.infer<typeof installmentIdParamSchema>;
export type DocumentSupplierIdParam = z.infer<typeof documentSupplierIdParamSchema>;
export type DocumentCustomerIdParam = z.infer<typeof documentCustomerIdParamSchema>;
export type VoidDocumentInput = z.infer<typeof voidDocumentSchema>;
export type DocumentAttachmentIdParam = DocumentIdParam &
  z.infer<typeof documentAttachmentIdParamSchema>;
