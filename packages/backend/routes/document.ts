import express from "express";
import { authenticateToken, authorize } from "../middleware/auth";
import {
  // Document validators
  validateCreateDocument,
  validateUpdateDocument,
  validateDocumentId,
  validateDocumentQuery,
  validateUpdateDocumentStatus,
  // Line validators
  validateDocumentLineId,
  validateAddDocumentLine,
  validateUpdateDocumentLine,
  // Conversion validators
  validateConvertDocument,
  validateDuplicateDocument,
  // Calculation validators
  validateRecalculateDocument,
  // Params validators
  validateDocumentCustomerIdParam,
  validateDocumentSupplierIdParam,
  // Installment validators
  validateCreateDocumentInstallments,
  validateDocumentInstallmentIdParam,
  validateUpdateDocumentInstallments,
  // Bulk validators
  validateBulkUpdateDocumentsStatus,
  validateBulkSendDocuments,
  // Attachment validators
  validateDocumentAttachmentIdParam,
  validateTopProductsReportQuery,
} from "../validators/document";
import {
  // Documents CRUD
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  // Document status
  updateDocumentStatus,
  sendDocument,
  approveDocument,
  rejectDocument,
  voidDocument,
  // Document lines
  getDocumentLines,
  addDocumentLine,
  updateDocumentLine,
  deleteDocumentLine,
  // Document conversions
  convertDocument,
  duplicateDocument,
  // Document calculations
  recalculateDocument,
  // Document installments
  getDocumentInstallments,
  updateInstallment,
  // Document by type
  getQuotes,
  getOrders,
  getInvoices,
  getDeliveryNotes,
  // Statistics
  getDocumentStatistics,
  getDocumentsByCustomer,
  getDocumentsBySupplier,
  // Export/Print
  exportDocumentPDF,
  exportDocumentExcel,
  printDocument,
  // Template
  createTemplateFromDocument,
  createDocumentFromTemplate,
  // Batch operations
  bulkUpdateDocuments,
  bulkChangeStatus,
  bulkSendDocuments,
  // Notifiche
  getExpiringDocuments,
  getOverdueInvoices,
  // Report
  getSalesReport,
  getTopCustomersReport,
  getTopProductsReport,
  // Stock movements
  generateStockMovements,
  // Validazione fiscale
  validateFiscalData,
  // Allegati
  uploadDocumentAttachment,
  getDocumentAttachments,
  deleteDocumentAttachment,
  // Audit
  getDocumentHistory,
  // Email
  sendDocumentByEmail,
  // Export batch
  exportDocumentsBatch,
} from "../controllers/document";

const router = express.Router();

// ============================================================================
// DOCUMENTS - List & Search
// ============================================================================

/**
 * @route   GET /api/documents
 * @desc    Lista tutti i documenti con filtri e paginazione
 * @access  Private (document:read)
 * @query   page, limit, search, documentType, status, customerId, supplierId, dateFrom, dateTo, sortBy, sortOrder
 */
router.get(
  "/",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentQuery,
  getAllDocuments,
);

/**
 * @route   GET /api/documents/statistics
 * @desc    Statistiche documenti
 * @access  Private (document:read)
 */
router.get(
  "/statistics",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  getDocumentStatistics,
);

/**
 * @route   GET /api/documents/quotes
 * @desc    Lista preventivi
 * @access  Private (document:read)
 */
router.get(
  "/quotes",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  getQuotes,
);

/**
 * @route   GET /api/documents/orders
 * @desc    Lista ordini
 * @access  Private (document:read)
 */
router.get(
  "/orders",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  getOrders,
);

/**
 * @route   GET /api/documents/invoices
 * @desc    Lista fatture
 * @access  Private (document:read)
 */
router.get(
  "/invoices",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  getInvoices,
);

/**
 * @route   GET /api/documents/delivery-notes
 * @desc    Lista DDT
 * @access  Private (document:read)
 */
router.get(
  "/delivery-notes",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  getDeliveryNotes,
);

/**
 * @route   GET /api/documents/customer/:customerId
 * @desc    Documenti per cliente
 * @access  Private (document:read)
 */
router.get(
  "/customer/:customerId",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentCustomerIdParam,
  getDocumentsByCustomer,
);

/**
 * @route   GET /api/documents/supplier/:supplierId
 * @desc    Documenti per fornitore
 * @access  Private (document:read)
 */
router.get(
  "/supplier/:supplierId",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentSupplierIdParam,
  getDocumentsBySupplier,
);

/**
 * @route   GET /api/documents/:id
 * @desc    Ottieni dettagli documento
 * @access  Private (document:read)
 */
router.get(
  "/:id",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  validateDocumentQuery,
  getDocumentById,
);

// ============================================================================
// DOCUMENTS - CRUD Operations
// ============================================================================

/**
 * @route   POST /api/documents
 * @desc    Crea un nuovo documento
 * @access  Private (document:create)
 */
router.post(
  "/",
  authenticateToken,
  authorize(["document:create", "document:manage"]),
  validateCreateDocument,
  createDocument,
);

/**
 * @route   PUT /api/documents/:id
 * @desc    Aggiorna un documento
 * @access  Private (document:update)
 */
router.put(
  "/:id",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateUpdateDocument,
  updateDocument,
);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Elimina un documento
 * @access  Private (document:delete)
 */
router.delete(
  "/:id",
  authenticateToken,
  authorize(["document:delete", "document:manage"]),
  validateDocumentId,
  deleteDocument,
);

// ============================================================================
// DOCUMENT STATUS Management
// ============================================================================

/**
 * @route   PATCH /api/documents/:id/status
 * @desc    Aggiorna status documento
 * @access  Private (document:update)
 */
router.patch(
  "/:id/status",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateUpdateDocumentStatus,
  updateDocumentStatus,
);

/**
 * @route   POST /api/documents/:id/send
 * @desc    Invia documento al cliente
 * @access  Private (document:update)
 */
router.post(
  "/:id/send",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  sendDocument,
);

/**
 * @route   POST /api/documents/:id/approve
 * @desc    Approva documento
 * @access  Private (document:update)
 */
router.post(
  "/:id/approve",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  approveDocument,
);

/**
 * @route   POST /api/documents/:id/reject
 * @desc    Rifiuta documento
 * @access  Private (document:update)
 */
router.post(
  "/:id/reject",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  rejectDocument,
);

/**
 * @route   POST /api/documents/:id/void
 * @desc    Annulla documento
 * @access  Private (document:update)
 */
router.post(
  "/:id/void",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  voidDocument,
);

// ============================================================================
// DOCUMENT LINES Management
// ============================================================================

/**
 * @route   GET /api/documents/:id/lines
 * @desc    Lista righe documento
 * @access  Private (document:read)
 */
router.get(
  "/:id/lines",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  getDocumentLines,
);

/**
 * @route   POST /api/documents/:id/lines
 * @desc    Aggiungi riga a documento
 * @access  Private (document:update)
 */
router.post(
  "/:id/lines",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateAddDocumentLine,
  addDocumentLine,
);

/**
 * @route   PUT /api/documents/:id/lines/:lineId
 * @desc    Aggiorna riga documento
 * @access  Private (document:update)
 */
router.put(
  "/:id/lines/:lineId",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateDocumentLineId,
  validateUpdateDocumentLine,
  updateDocumentLine,
);

/**
 * @route   DELETE /api/documents/:id/lines/:lineId
 * @desc    Elimina riga documento
 * @access  Private (document:update)
 */
router.delete(
  "/:id/lines/:lineId",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateDocumentLineId,
  deleteDocumentLine,
);

// ============================================================================
// DOCUMENT CONVERSIONS
// ============================================================================

/**
 * @route   POST /api/documents/:id/convert
 * @desc    Converti documento (es. Quote → Order)
 * @access  Private (document:create)
 */
router.post(
  "/:id/convert",
  authenticateToken,
  authorize(["document:create", "document:manage"]),
  validateDocumentId,
  validateConvertDocument,
  convertDocument,
);

/**
 * @route   POST /api/documents/:id/duplicate
 * @desc    Duplica documento
 * @access  Private (document:create)
 */
router.post(
  "/:id/duplicate",
  authenticateToken,
  authorize(["document:create", "document:manage"]),
  validateDocumentId,
  validateDuplicateDocument,
  duplicateDocument,
);

// ============================================================================
// DOCUMENT CALCULATIONS
// ============================================================================

/**
 * @route   POST /api/documents/:id/recalculate
 * @desc    Ricalcola totali documento
 * @access  Private (document:update)
 */
router.post(
  "/:id/recalculate",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateRecalculateDocument,
  recalculateDocument,
);

// ============================================================================
// PAYMENT INSTALLMENTS
// ============================================================================

/**
 * @route   GET /api/documents/:id/installments
 * @desc    Lista rate pagamento documento
 * @access  Private (document:read)
 */
router.get(
  "/:id/installments",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  validateCreateDocumentInstallments,
  getDocumentInstallments,
);

/**
 * @route   PUT /api/documents/:id/installments/:installmentId
 * @desc    Aggiorna rata pagamento
 * @access  Private (document:update)
 */
router.put(
  "/:id/installments/:installmentId",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateDocumentInstallmentIdParam,
  validateUpdateDocumentInstallments,
  updateInstallment,
);

// ============================================================================
// EXPORT & PRINT
// ============================================================================

/**
 * @route   GET /api/documents/:id/export/pdf
 * @desc    Esporta documento in PDF
 * @access  Private (document:read)
 */
router.get(
  "/:id/export/pdf",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  exportDocumentPDF,
);

/**
 * @route   GET /api/documents/:id/export/excel
 * @desc    Esporta documento in Excel
 * @access  Private (document:read)
 */
router.get(
  "/:id/export/excel",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  exportDocumentExcel,
);

/**
 * @route   GET /api/documents/:id/print
 * @desc    Stampa documento
 * @access  Private (document:read)
 */
router.get(
  "/:id/print",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  printDocument,
);

// ============================================================================
// TEMPLATE MANAGEMENT
// ============================================================================

/**
 * @route   POST /api/documents/:id/create-template
 * @desc    Crea template da documento esistente
 * @access  Private (document:manage)
 */
router.post(
  "/:id/create-template",
  authenticateToken,
  authorize(["document:manage"]),
  validateDocumentId,
  createTemplateFromDocument,
);

/**
 * @route   POST /api/documents/from-template
 * @desc    Crea documento da template
 * @access  Private (document:create)
 */
router.post(
  "/from-template",
  authenticateToken,
  authorize(["document:create", "document:manage"]),
  createDocumentFromTemplate,
);

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * @route   POST /api/documents/bulk-update
 * @desc    Aggiorna multipli documenti
 * @access  Private (document:update)
 */
router.post(
  "/bulk-update",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  bulkUpdateDocuments,
);

/**
 * @route   POST /api/documents/bulk-change-status
 * @desc    Cambia status multipli documenti
 * @access  Private (document:update)
 */
router.post(
  "/bulk-change-status",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateBulkUpdateDocumentsStatus,
  bulkChangeStatus,
);

/**
 * @route   POST /api/documents/bulk-send
 * @desc    Invia multipli documenti
 * @access  Private (document:update)
 */
router.post(
  "/bulk-send",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateBulkSendDocuments,
  bulkSendDocuments,
);

// ============================================================================
// NOTIFICATIONS & ALERTS
// ============================================================================

/**
 * @route   GET /api/documents/expiring
 * @desc    Documenti in scadenza
 * @access  Private (document:read)
 * @query   days (default: 7)
 */
router.get(
  "/expiring",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  getExpiringDocuments,
);

/**
 * @route   GET /api/documents/overdue
 * @desc    Fatture scadute non pagate
 * @access  Private (document:read)
 */
router.get(
  "/overdue",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  getOverdueInvoices,
);

// ============================================================================
// ADVANCED REPORTS
// ============================================================================

/**
 * @route   GET /api/documents/reports/sales
 * @desc    Report vendite per periodo
 * @access  Private (report:read)
 * @query   dateFrom, dateTo, groupBy (day/month/year)
 */
router.get(
  "/reports/sales",
  authenticateToken,
  authorize(["report:read", "document:manage"]),
  getSalesReport,
);

/**
 * @route   GET /api/documents/reports/top-customers
 * @desc    Clienti con maggiore fatturato
 * @access  Private (report:read)
 * @query   limit, dateFrom, dateTo
 */
router.get(
  "/reports/top-customers",
  authenticateToken,
  authorize(["report:read", "document:manage"]),
  getTopCustomersReport,
);

/**
 * @route   GET /api/documents/reports/top-products
 * @desc    Prodotti più venduti
 * @access  Private (report:read)
 * @query   limit, dateFrom, dateTo
 */
router.get(
  "/reports/top-products",
  authenticateToken,
  authorize(["report:read", "document:manage"]),
  validateTopProductsReportQuery,
  getTopProductsReport,
);

// ============================================================================
// STOCK MOVEMENTS
// ============================================================================

/**
 * @route   POST /api/documents/:id/generate-stock-movements
 * @desc    Genera movimenti magazzino da documento
 * @access  Private (warehouse:update)
 */
router.post(
  "/:id/generate-stock-movements",
  authenticateToken,
  authorize(["warehouse:update", "document:manage"]),
  validateDocumentId,
  generateStockMovements,
);

// ============================================================================
// FISCAL VALIDATION
// ============================================================================

/**
 * @route   GET /api/documents/:id/validate-fiscal
 * @desc    Verifica validità fiscale documento
 * @access  Private (document:read)
 */
router.get(
  "/:id/validate-fiscal",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  validateFiscalData,
);

// ============================================================================
// ATTACHMENTS
// ============================================================================

/**
 * @route   POST /api/documents/:id/attachments
 * @desc    Carica allegato documento
 * @access  Private (document:update)
 */
router.post(
  "/:id/attachments",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  // TODO: Add multer middleware for file upload
  uploadDocumentAttachment,
);

/**
 * @route   GET /api/documents/:id/attachments
 * @desc    Lista allegati documento
 * @access  Private (document:read)
 */
router.get(
  "/:id/attachments",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  getDocumentAttachments,
);

/**
 * @route   DELETE /api/documents/:id/attachments/:attachmentId
 * @desc    Elimina allegato
 * @access  Private (document:update)
 */
router.delete(
  "/:id/attachments/:attachmentId",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  validateDocumentAttachmentIdParam,
  deleteDocumentAttachment,
);

// ============================================================================
// AUDIT & HISTORY
// ============================================================================

/**
 * @route   GET /api/documents/:id/history
 * @desc    Storia modifiche documento
 * @access  Private (document:read)
 */
router.get(
  "/:id/history",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  validateDocumentId,
  getDocumentHistory,
);

// ============================================================================
// EMAIL INTEGRATION
// ============================================================================

/**
 * @route   POST /api/documents/:id/send-email
 * @desc    Invia documento via email
 * @access  Private (document:update)
 */
router.post(
  "/:id/send-email",
  authenticateToken,
  authorize(["document:update", "document:manage"]),
  validateDocumentId,
  sendDocumentByEmail,
);

// ============================================================================
// BATCH EXPORT
// ============================================================================

/**
 * @route   POST /api/documents/export-batch
 * @desc    Export multipli documenti (PDF/Excel)
 * @access  Private (document:read)
 */
router.post(
  "/export-batch",
  authenticateToken,
  authorize(["document:read", "document:manage"]),
  exportDocumentsBatch,
);

// ============================================================================
// SUMMARY: TOTAL ENDPOINTS
// ============================================================================

/**
 * RIEPILOGO COMPLETO ENDPOINTS DOCUMENTI:
 *
 * BASE (già implementati): 40 endpoints
 * - CRUD documenti
 * - Gestione status
 * - Righe e rate
 * - Conversioni
 * - Export base

 * - Template: 2
 * - Batch operations: 3
 * - Notifications: 2
 * - Reports: 3
 * - Stock movements: 1
 * - Fiscal validation: 1
 * - Attachments: 3
 * - Audit: 1
 * - Email: 1
 * - Batch export: 1
 *
 * TOTALE: 58 ENDPOINTS
 */

// ============================================================================
// EXPORT
// ============================================================================

export default router;
