import { z } from "zod";
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
  documentLineQuerySchema,
  documentQuerySchema,
  documentStatsSchema,
  generateInstallmentsSchema,
  installmentIdParamSchema,
  installmentQuerySchema,
  overdueInstallmentsQuerySchema,
  payInstallmentSchema,
  rejectDocumentSchema,
  reorderDocumentLinesSchema,
  replaceInstallmentsSchema,
  salesReportSchema,
  sendDocumentSchema,
  topProductsReportSchema,
  updateDocumentSchema,
  updateDocumentStatusSchema,
  voidDocumentSchema,
} from "../../validators/document";

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateDocumentLineInput = z.infer<typeof createDocumentLineSchema>;

export type GenerateInstallmentsInput = z.infer<typeof generateInstallmentsSchema>;
export type ReplaceInstallmentsInput = z.infer<typeof replaceInstallmentsSchema>;
export type PayInstallmentInput = z.infer<typeof payInstallmentSchema>;

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type UpdateDocumentStatusInput = z.infer<typeof updateDocumentStatusSchema>;
export type ApproveDocumentInput = z.infer<typeof approveDocumentSchema>;
export type RejectDocumentInput = z.infer<typeof rejectDocumentSchema>;
export type SendDocumentInput = z.infer<typeof sendDocumentSchema>;
export type ConvertDocumentInput = z.infer<typeof convertDocumentSchema>;
export type CloneDocumentInput = z.infer<typeof cloneDocumentSchema>;

export type ReorderDocumentLinesInput = z.infer<typeof reorderDocumentLinesSchema>;

export type BulkUpdateDocumentsStatusInput = z.infer<typeof bulkUpdateDocumentsStatusSchema>;
export type BulkDeleteDocumentsInput = z.infer<typeof bulkDeleteDocumentsSchema>;


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
export type OverdueInstallmentsQueryInput = z.input<typeof overdueInstallmentsQuerySchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type DocumentIdParam = z.infer<typeof documentIdParamSchema>;
export type DocumentLineIdParam = DocumentIdParam & z.infer<typeof documentLineIdParamSchema>;
export type InstallmentIdParam = DocumentIdParam & z.infer<typeof installmentIdParamSchema>;
export type VoidDocumentInput = z.infer<typeof voidDocumentSchema>;
export type DocumentAttachmentIdParam = DocumentIdParam &
  z.infer<typeof documentAttachmentIdParamSchema>;
