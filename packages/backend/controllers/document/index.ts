// ============================================================================
// DOCUMENT CONTROLLERS — BARREL EXPORT
// ============================================================================

// CRUD — create, read, update, delete, list, recalculate
export {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  recalculateDocument,
} from "./document-crud-controller";

// STATUS — transitions, approval workflow, send, history
export {
  updateDocumentStatus,
  approveDocument,
  rejectDocument,
  voidDocument,
  sendDocument,
  getDocumentHistory,
} from "./document-status-controller";

// LINES — add, update, delete, reorder, bulk
export {
  getDocumentLines,
  getDocumentLineById,
  addDocumentLine,
  updateDocumentLine,
  deleteDocumentLine,
  reorderDocumentLines,
  bulkAddDocumentLines,
} from "./document-lines-controller";

// FULFILLMENT — status, per-line delivered qty, delivery note
export {
  getDocumentFulfillment,
  getFulfillmentStatus,
  updateLineDelivered,
  createDeliveryNote,
} from "./document-fulfillment-controller";

// INSTALLMENTS — CRUD, pay, generate plan
export {
  getDocumentInstallments,
  getInstallmentById,
  createInstallment,
  updateInstallment,
  deleteInstallment,
  payInstallment,
  generateInstallmentPlan,
} from "./document-installments-controller";

// CONVERSION — clone, convert, relations
export {
  cloneDocument,
  convertDocument,
  createDocumentRelation,
  getDocumentRelations,
  deleteDocumentRelation,
} from "./document-conversion-controller";

// REPORTS — stats, sales, aging, top products, timeline, overdue installments
export {
  getDocumentStats,
  getSalesReport,
  getAgingReport,
  getTopProducts,
  getDocumentTimeline,
  getOverdueInstallments,
} from "./document-reports-controller";

// BULK — status update, soft delete, send, export
export {
  bulkChangeStatus,
  bulkDeleteDocuments,
  bulkSendDocuments,
  bulkExportDocuments,
} from "./document-bulk-controller";
