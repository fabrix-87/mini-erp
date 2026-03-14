// ============================================================================
// DOCUMENT HELPERS (SHARED)
// Domain-specific helpers for UI and display
// Can be used in both frontend and backend
// ============================================================================

import type { DocumentStatus, DocumentType } from "../types/document";

/**
 * Status descriptions in Italian
 */
export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  DRAFT: "Bozza",
  PENDING_APPROVAL: "In attesa di approvazione",
  SENT: "Inviato",
  ACCEPTED: "Accettato",
  REJECTED: "Rifiutato",
  PREPARING: "In preparazione",
  PARTIALLY_FULFILLED: "Parzialmente evaso",
  FULFILLED: "Completamente evaso",
  IN_TRANSIT: "In transito",
  DELIVERED: "Consegnato",
  UNPAID: "Non pagato",
  PARTIALLY_PAID: "Parzialmente pagato",
  PAID: "Pagato",
  OVERDUE: "Scaduto",
  VOIDED: "Annullato",
  CLOSED: "Chiuso",
};

/**
 * Status badge colors for UI (Tailwind/shadcn)
 */
export const DOCUMENT_STATUS_COLORS: Record<
  DocumentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "secondary",
  PENDING_APPROVAL: "outline",
  SENT: "default",
  ACCEPTED: "default",
  REJECTED: "destructive",
  PREPARING: "default",
  PARTIALLY_FULFILLED: "outline",
  FULFILLED: "default",
  IN_TRANSIT: "default",
  DELIVERED: "default",
  UNPAID: "outline",
  PARTIALLY_PAID: "outline",
  PAID: "default",
  OVERDUE: "destructive",
  VOIDED: "secondary",
  CLOSED: "secondary",
};

/**
 * Get status description
 */
export const getStatusLabel = (status: DocumentStatus): string => {
  return DOCUMENT_STATUS_LABELS[status] || status;
};

/**
 * Get status color for badge
 */
export const getStatusColor = (
  status: DocumentStatus,
): "default" | "secondary" | "destructive" | "outline" => {
  return DOCUMENT_STATUS_COLORS[status] || "default";
};

/**
 * Document type labels in Italian
 */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  QUOTE: "Preventivo",
  PROFORMA: "Proforma",
  ORDER: "Ordine Cliente",
  DELIVERY_NOTE: "DDT",
  INVOICE: "Fattura",
  CREDIT_NOTE: "Nota di Credito",
  DEBIT_NOTE: "Nota di Debito",
  SUPPLIER_ORDER: "Ordine Fornitore",
  ARCHIVED: "Archiviato",
};

/**
 * Get document type label
 */
export const getDocumentTypeLabel = (type: DocumentType): string => {
  return DOCUMENT_TYPE_LABELS[type] || type;
};

/**
 * Document type icons (for UI)
 */
export const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  QUOTE: "file-text",
  PROFORMA: "file-check",
  ORDER: "shopping-cart",
  DELIVERY_NOTE: "truck",
  INVOICE: "receipt",
  CREDIT_NOTE: "receipt-refund",
  DEBIT_NOTE: "receipt",
  SUPPLIER_ORDER: "package",
  ARCHIVED: "archive",
};

/**
 * Get document type icon name
 */
export const getDocumentTypeIcon = (type: DocumentType): string => {
  return DOCUMENT_TYPE_ICONS[type] || "file";
};

/**
 * Format document number for display
 */
export const formatDocumentNumberDisplay = (
  documentNumber: string | null,
): string => {
  return documentNumber || "BOZZA";
};

/**
 * Get overdue status
 */
export const isOverdue = (dueDate: Date | string | null): boolean => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  return due < today;
};

/**
 * Get fulfillment status label
 */
export const getFulfillmentStatusLabel = (
  deliveredQty: number,
  totalQty: number,
): string => {
  if (deliveredQty === 0) return "Da evadere";
  if (deliveredQty >= totalQty) return "Completamente evaso";
  return "Parzialmente evaso";
};

/**
 * Get payment status label
 */
export const getPaymentStatusLabel = (
  paidAmount: number,
  totalAmount: number,
): string => {
  if (paidAmount === 0) return "Non pagato";
  if (paidAmount >= totalAmount) return "Pagato";
  return "Parzialmente pagato";
};

/**
 * Validate installments sum to 100%
 */
export const validateInstallmentsPercentage = (
  installments: Array<{ percentage: number | string }>,
): {
  valid: boolean;
  totalPercentage: number;
} => {
  const totalPercentage = installments.reduce(
    (sum, inst) => sum + Number(inst.percentage),
    0,
  );

  return {
    valid: Math.abs(totalPercentage - 100) < 0.01,
    totalPercentage,
  };
};
