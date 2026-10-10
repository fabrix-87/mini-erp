// ============================================================================
// DOCUMENT HELPERS (SHARED)
// Domain-specific helpers for UI and display
// Can be used in both frontend and backend
// ============================================================================

import { DOCUMENT_TYPE_STATUS_TRANSITIONS, INBOUND_DOCUMENT_TYPES, InboundDocumentType } from "../constants";
import type { DocumentStatus, DocumentType } from "../types/document";

/**
 * Checks whether a status transition is allowed for a document type.
 *
 * @param type - Document type
 * @param from - Current status
 * @param to - Target status
 * @returns true when the transition exists in DOCUMENT_TYPE_STATUS_TRANSITIONS
 */
export const canTransition = (type: DocumentType, from: DocumentStatus, to: DocumentStatus): boolean =>
  DOCUMENT_TYPE_STATUS_TRANSITIONS[type][from]?.includes(to) ?? false;

/**
 * Lists the statuses a document can move to. Used by the UI to render the available actions.
 *
 * @param type - Document type
 * @param from - Current status
 * @returns Allowed target statuses (empty for terminal statuses)
 */
export const getAvailableTransitions = (type: DocumentType, from: DocumentStatus): DocumentStatus[] =>
  DOCUMENT_TYPE_STATUS_TRANSITIONS[type][from] ?? [];

/**
 * Checks whether a document type can ever be voided, derived from the transition map
 * so the rule and the workflow cannot diverge.
 *
 * @param type - Document type
 * @returns true when VOIDED is reachable from at least one status
 */
export const canDocumentTypeBeVoided = (type: DocumentType): boolean =>
  Object.values(DOCUMENT_TYPE_STATUS_TRANSITIONS[type]).some((targets) => targets?.includes("VOIDED"));

/**
 * Status badge colors for UI (Tailwind/shadcn) --- spostare nel frontend
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
 * Get status color for badge
 */
export const getStatusColor = (
  status: DocumentStatus,
): "default" | "secondary" | "destructive" | "outline" => {
  return DOCUMENT_STATUS_COLORS[status] || "default";
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

/**
 * Checks whether a document type is received from a counterparty (INBOUND direction).
 *
 * @param type - The document type to check
 * @returns true when the type belongs to the inbound (passive) cycle
 */
export const isInboundDocumentType = (type: DocumentType): type is InboundDocumentType =>
  (INBOUND_DOCUMENT_TYPES as readonly DocumentType[]).includes(type);