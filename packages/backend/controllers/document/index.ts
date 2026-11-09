// ============================================================================
// DOCUMENT CONTROLLERS — BARREL EXPORT
// ============================================================================

// CRUD — create, read, update, delete, list, recalculate
export * from "./document-crud-controller";

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
export * from "./document-lines-controller";

// FULFILLMENT — status, per-line delivered qty, delivery note
export { getDocumentFulfillment } from "./document-fulfillment-controller";

// INSTALLMENTS — CRUD, pay, generate plan
export * from "./document-installments-controller";

// CONVERSION — clone, convert, relations
export {
  cloneDocument,
  convertDocument,
  getDocumentRelations,
} from "./document-conversion-controller";

// REPORTS — stats, sales, aging, top products, timeline, overdue installments
export {
  getDocumentStats,
  getSalesReport,
  getAgingReport,
  getTopProducts,
  getOverdueInstallments,
} from "./document-reports-controller";

// BULK — status update, soft delete
export * from "./document-bulk-controller";
