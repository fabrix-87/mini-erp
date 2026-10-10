// ============================================================================
// DOCUMENT CONSTANTS
// Shared between frontend and backend
// ============================================================================

import { DocumentStatus, DocumentType, InstallmentStatus } from "../types";

/**
 * Document types enum
 */
export const DOCUMENT_TYPES = {
  QUOTE: "QUOTE",
  PROFORMA: "PROFORMA",
  ORDER: "ORDER",
  DELIVERY_NOTE: "DELIVERY_NOTE",
  INVOICE: "INVOICE",
  CREDIT_NOTE: "CREDIT_NOTE",
  DEBIT_NOTE: "DEBIT_NOTE",
  SUPPLIER_ORDER: "SUPPLIER_ORDER",
  ARCHIVED: "ARCHIVED",
  SUPPLIER_INVOICE: "SUPPLIER_INVOICE",
  SUPPLIER_CREDIT_NOTE: "SUPPLIER_CREDIT_NOTE",
  SUPPLIER_DELIVERY_NOTE: "SUPPLIER_DELIVERY_NOTE",
  SELF_INVOICE: "SELF_INVOICE",
} as const;

export const DOCUMENT_PARTY_ROLES = {
  COUNTERPARTY: "COUNTERPARTY",
  TENANT: "TENANT",
  SHIPPING: "SHIPPING",
  CARRIER: "CARRIER",
} as const;

export const DOCUMENT_DIRECTIONS = { OUTBOUND: "OUTBOUND", INBOUND: "INBOUND" } as const;

export const MATCH_STATUSES = {
  NOT_MATCHED: "NOT_MATCHED",
  MATCHED: "MATCHED",
  MATCHED_WITH_VARIANCE: "MATCHED_WITH_VARIANCE",
  DISPUTED: "DISPUTED",
} as const;

/**
 * Document statuses enum
 */
export const DOCUMENT_STATUSES = {
  // Draft phase
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  // Active phase
  SENT: "SENT",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  // Fulfillment phase
  PREPARING: "PREPARING",
  PARTIALLY_FULFILLED: "PARTIALLY_FULFILLED",
  FULFILLED: "FULFILLED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  // Payment phase
  UNPAID: "UNPAID",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  // Closed phase
  VOIDED: "VOIDED",
  CLOSED: "CLOSED",
} as const;

/** Document types received from third parties: numbering is owned by the counterparty. */
export const INBOUND_DOCUMENT_TYPES = [
  "SUPPLIER_INVOICE",
  "SUPPLIER_CREDIT_NOTE",
  "SUPPLIER_DELIVERY_NOTE",
] as const satisfies readonly DocumentType[];

export type InboundDocumentType = (typeof INBOUND_DOCUMENT_TYPES)[number];
export type OutboundDocumentType = Exclude<DocumentType, InboundDocumentType>;

// ============================================================================
// DOCUMENT NUMBERING CONFIGURATION
// ============================================================================

/**
 * Document number prefixes for sequential numbering
 * Used by DocumentSequence to generate documentNumber
 */
export const DOCUMENT_PREFIXES: Record<OutboundDocumentType, string> = {
  QUOTE: "PRV",
  PROFORMA: "PRO",
  ORDER: "ORD",
  DELIVERY_NOTE: "DDT",
  INVOICE: "FT",
  CREDIT_NOTE: "NC",
  DEBIT_NOTE: "ND",
  SUPPLIER_ORDER: "ODA",
  ARCHIVED: "ARC",
  SELF_INVOICE: "AF",
} as const;

/**
 * Number padding (digit count) for document numbers
 */
export const DOCUMENT_NUMBER_PADDING: Record<OutboundDocumentType, number> = {
  QUOTE: 4,
  PROFORMA: 4,
  ORDER: 5,
  DELIVERY_NOTE: 5,
  INVOICE: 5,
  CREDIT_NOTE: 5,
  DEBIT_NOTE: 5,
  SUPPLIER_ORDER: 5,
  ARCHIVED: 4,
  SELF_INVOICE: 5,
} as const;

/**
 * Reset sequence yearly configuration
 * true = reset every year (e.g., 1/2026, 1/2027)
 * false = continuous numbering (e.g., 1, 2, 3, ...)
 */
export const RESET_SEQUENCE_YEARLY: Record<OutboundDocumentType, boolean> = {
  QUOTE: true,
  PROFORMA: true,
  ORDER: true,
  DELIVERY_NOTE: true,
  INVOICE: true,
  CREDIT_NOTE: true,
  DEBIT_NOTE: true,
  SUPPLIER_ORDER: true,
  ARCHIVED: true,
  SELF_INVOICE: true,
} as const;

// ============================================================================
// STATUS TRANSITIONS & WORKFLOWS
// ============================================================================

/**
 * Allowed status transitions (global - all document types)
 * Use this for basic validation
 */
export const DOCUMENT_STATUS_TRANSITIONS = {
  DRAFT: ["PENDING_APPROVAL", "SENT", "VOIDED"],
  PENDING_APPROVAL: ["DRAFT", "SENT", "REJECTED", "VOIDED"],
  SENT: ["ACCEPTED", "REJECTED", "VOIDED"],
  ACCEPTED: ["PREPARING", "PARTIALLY_FULFILLED", "FULFILLED", "UNPAID", "VOIDED"],
  REJECTED: ["DRAFT", "VOIDED"],
  PREPARING: ["PARTIALLY_FULFILLED", "FULFILLED", "IN_TRANSIT", "DELIVERED", "VOIDED"],
  PARTIALLY_FULFILLED: ["FULFILLED", "IN_TRANSIT", "VOIDED"],
  FULFILLED: ["IN_TRANSIT", "DELIVERED", "VOIDED"],
  IN_TRANSIT: ["DELIVERED", "VOIDED"],
  DELIVERED: ["UNPAID", "CLOSED", "VOIDED"],
  UNPAID: ["PARTIALLY_PAID", "PAID", "OVERDUE", "VOIDED"],
  PARTIALLY_PAID: ["PAID", "OVERDUE", "VOIDED"],
  PAID: ["CLOSED"],
  OVERDUE: ["PARTIALLY_PAID", "PAID", "VOIDED"],
  VOIDED: [], // Terminal state
  CLOSED: [], // Terminal state
} as const;

/**
 * Status transitions specific per document type
 * Use this for strict workflow enforcement
 */
export const DOCUMENT_TYPE_STATUS_TRANSITIONS: Record<
  DocumentType,
  Partial<Record<DocumentStatus, DocumentStatus[]>>
> = {
  QUOTE: {
    DRAFT: ["PENDING_APPROVAL", "SENT"],
    PENDING_APPROVAL: ["SENT", "DRAFT"],
    SENT: ["ACCEPTED", "REJECTED", "CLOSED"],
    ACCEPTED: ["CLOSED"],
    REJECTED: ["CLOSED"],
  },
  PROFORMA: {
    DRAFT: ["PENDING_APPROVAL", "SENT"],
    PENDING_APPROVAL: ["SENT", "DRAFT"],
    SENT: ["ACCEPTED", "REJECTED", "CLOSED"],
    ACCEPTED: ["CLOSED"],
    REJECTED: ["CLOSED"],
  },
  ORDER: {
    DRAFT: ["PENDING_APPROVAL", "ACCEPTED"],
    PENDING_APPROVAL: ["ACCEPTED", "REJECTED", "DRAFT"],
    ACCEPTED: ["PREPARING", "PARTIALLY_FULFILLED", "FULFILLED", "VOIDED"],
    REJECTED: ["CLOSED"],
    PREPARING: ["PARTIALLY_FULFILLED", "FULFILLED", "IN_TRANSIT", "DELIVERED"],
    PARTIALLY_FULFILLED: ["FULFILLED", "IN_TRANSIT"], // VOIDED removed: part of the order is already delivered
    FULFILLED: ["IN_TRANSIT", "DELIVERED"],
    IN_TRANSIT: ["DELIVERED"],
    DELIVERED: ["CLOSED"],
  },
  DELIVERY_NOTE: {
    DRAFT: ["IN_TRANSIT"],
    IN_TRANSIT: ["DELIVERED", "DRAFT"],
    DELIVERED: ["CLOSED"],
  },
  INVOICE: {
    DRAFT: ["PENDING_APPROVAL", "SENT"],
    PENDING_APPROVAL: ["SENT", "DRAFT"],
    SENT: ["UNPAID", "VOIDED"],
    UNPAID: ["PARTIALLY_PAID", "PAID", "OVERDUE", "VOIDED"],
    PARTIALLY_PAID: ["PAID", "OVERDUE"],
    OVERDUE: ["PARTIALLY_PAID", "PAID"],
    PAID: ["CLOSED"],
  },
  CREDIT_NOTE: {
    DRAFT: ["PENDING_APPROVAL", "SENT"],
    PENDING_APPROVAL: ["SENT", "DRAFT"],
    SENT: ["CLOSED", "VOIDED"],
  },
  DEBIT_NOTE: {
    DRAFT: ["PENDING_APPROVAL", "SENT"],
    PENDING_APPROVAL: ["SENT", "DRAFT"],
    SENT: ["UNPAID", "VOIDED"],
    UNPAID: ["PAID", "OVERDUE"],
    OVERDUE: ["PAID"],
    PAID: ["CLOSED"],
  },
  SUPPLIER_ORDER: {
    DRAFT: ["SENT"],
    SENT: ["ACCEPTED", "REJECTED", "VOIDED"],
    ACCEPTED: ["PREPARING", "DELIVERED"],
    PREPARING: ["DELIVERED"],
    DELIVERED: ["CLOSED"],
  },
  SUPPLIER_INVOICE: {
    DRAFT: ["UNPAID"],
    UNPAID: ["PARTIALLY_PAID", "PAID", "OVERDUE", "VOIDED"],
    PARTIALLY_PAID: ["PAID", "OVERDUE"],
    OVERDUE: ["PARTIALLY_PAID", "PAID"],
    PAID: ["CLOSED"],
  },
  SUPPLIER_CREDIT_NOTE: {
    DRAFT: ["CLOSED"],
  },
  SUPPLIER_DELIVERY_NOTE: {
    DRAFT: ["DELIVERED"],
    DELIVERED: ["CLOSED"],
  },
  /** SELF_INVOICE is system-generated and numbered at creation (reverse charge). */
  SELF_INVOICE: { SENT: ["CLOSED", "VOIDED"] },
  ARCHIVED: {},
};

/**
 * Statuses requiring document number
 * When transitioning to these states, document MUST have a number
 */
export const STATUSES_REQUIRING_NUMBER: readonly DocumentStatus[] = [
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "PREPARING",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "IN_TRANSIT",
  "DELIVERED",
  "UNPAID",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CLOSED",
] as const;

/**
 * Statuses that don't require document number
 */
export const STATUSES_WITHOUT_NUMBER: readonly DocumentStatus[] = [
  "DRAFT",
  "PENDING_APPROVAL",
] as const;

// ============================================================================
// DOCUMENT TYPE CONFIGURATION
// ============================================================================

/**
 * Configuration specific per document type
 */
export const DOCUMENT_TYPE_CONFIG: Record<
  DocumentType,
  {
    requiresCustomer: boolean;
    requiresSupplier: boolean;
    requiresWarehouse: boolean;
    requiresPaymentMethod: boolean;
    allowNegativeQuantity: boolean;
    requiresEInvoicing: boolean;
    affectsStock: boolean;
  }
> = {
  QUOTE: {
    requiresCustomer: true,
    requiresSupplier: false,
    requiresWarehouse: false,
    requiresPaymentMethod: false,
    allowNegativeQuantity: false,
    requiresEInvoicing: false,
    affectsStock: false,
  },
  PROFORMA: {
    requiresCustomer: true,
    requiresSupplier: false,
    requiresWarehouse: false,
    requiresPaymentMethod: true,
    allowNegativeQuantity: false,
    requiresEInvoicing: false,
    affectsStock: false,
  },
  ORDER: {
    requiresCustomer: true,
    requiresSupplier: false,
    requiresWarehouse: true,
    requiresPaymentMethod: true,
    allowNegativeQuantity: false,
    requiresEInvoicing: false,
    affectsStock: false, // Stock affected only on delivery
  },
  DELIVERY_NOTE: {
    requiresCustomer: true,
    requiresSupplier: false,
    requiresWarehouse: true,
    requiresPaymentMethod: false,
    allowNegativeQuantity: false,
    requiresEInvoicing: false,
    affectsStock: true,
  },
  INVOICE: {
    requiresCustomer: true,
    requiresSupplier: false,
    requiresWarehouse: false,
    requiresPaymentMethod: true,
    allowNegativeQuantity: false,
    requiresEInvoicing: true,
    affectsStock: true,
  },
  CREDIT_NOTE: {
    requiresCustomer: true,
    requiresSupplier: false,
    requiresWarehouse: false,
    requiresPaymentMethod: false,
    allowNegativeQuantity: true,
    requiresEInvoicing: true,
    affectsStock: true,
  },
  DEBIT_NOTE: {
    requiresCustomer: true,
    requiresSupplier: false,
    requiresWarehouse: false,
    requiresPaymentMethod: false,
    allowNegativeQuantity: false,
    requiresEInvoicing: true,
    affectsStock: false,
  },
  SUPPLIER_ORDER: {
    requiresCustomer: false,
    requiresSupplier: true,
    requiresWarehouse: true,
    requiresPaymentMethod: false,
    allowNegativeQuantity: false,
    requiresEInvoicing: false,
    affectsStock: true,
  },
  SUPPLIER_INVOICE: {
    requiresCustomer: false,
    requiresSupplier: true,
    requiresWarehouse: false,
    requiresPaymentMethod: true,
    allowNegativeQuantity: false,
    requiresEInvoicing: false,
    affectsStock: false,
  },
  SUPPLIER_CREDIT_NOTE: {
    requiresCustomer: false,
    requiresSupplier: true,
    requiresWarehouse: false,
    requiresPaymentMethod: false,
    allowNegativeQuantity: true,
    requiresEInvoicing: false,
    affectsStock: false,
  },
  SUPPLIER_DELIVERY_NOTE: {
    requiresCustomer: false,
    requiresSupplier: true,
    requiresWarehouse: true,
    requiresPaymentMethod: false,
    allowNegativeQuantity: false,
    requiresEInvoicing: false,
    affectsStock: true,
  },
  SELF_INVOICE: {
    requiresCustomer: false,
    requiresSupplier: true,
    requiresWarehouse: false,
    requiresPaymentMethod: false,
    allowNegativeQuantity: false,
    requiresEInvoicing: true,
    affectsStock: false,
  },
  ARCHIVED: {
    requiresCustomer: false,
    requiresSupplier: false,
    requiresWarehouse: false,
    requiresPaymentMethod: false,
    allowNegativeQuantity: false,
    requiresEInvoicing: false,
    affectsStock: false,
  },
};

/**
 * Document types that generate stock movements
 */
export const DOCUMENT_TYPES_WITH_STOCK_MOVEMENTS: readonly DocumentType[] = [
  "DELIVERY_NOTE",
  "INVOICE",
  "CREDIT_NOTE",
  "SUPPLIER_ORDER",
  "SUPPLIER_DELIVERY_NOTE",
] as const;

// ============================================================================
// STATUS CATEGORIES (for UI)
// ============================================================================

/**
 * Status categories for UI grouping
 */
export const STATUS_CATEGORIES = {
  DRAFT_PHASE: ["DRAFT", "PENDING_APPROVAL"],
  APPROVAL_PHASE: ["SENT"],
  ACTIVE_PHASE: ["ACCEPTED", "REJECTED"],
  FULFILLMENT_PHASE: ["PREPARING", "PARTIALLY_FULFILLED", "FULFILLED", "IN_TRANSIT", "DELIVERED"],
  PAYMENT_PHASE: ["UNPAID", "PARTIALLY_PAID", "PAID", "OVERDUE"],
  CLOSED_PHASE: ["VOIDED", "CLOSED"],
} as const;

/**
 * Document status category enum
 */
export const DOCUMENT_STATUS_CATEGORIES = {
  DRAFT_PHASE: "DRAFT_PHASE",
  APPROVAL_PHASE: "APPROVAL_PHASE",
  ACTIVE_PHASE: "ACTIVE_PHASE",
  FULFILLMENT_PHASE: "FULFILLMENT_PHASE",
  PAYMENT_PHASE: "PAYMENT_PHASE",
  CLOSED_PHASE: "CLOSED_PHASE",
} as const;

// ============================================================================
// DOCUMENT RELATIONS & CONVERSIONS
// ============================================================================

/**
 * Document relation types
 */
export const DOCUMENT_RELATION_TYPES = {
  CONVERTS_TO: "CONVERTS_TO",
  CLONED_FROM: "CLONED_FROM",
  SPLITS_FROM: "SPLITS_FROM",
  MERGES_INTO: "MERGES_INTO",
  CREDITS: "CREDITS",
  AMENDS: "AMENDS",
  FULFILLS: "FULFILLS",
  MIRRORS: "MIRRORS",
} as const;

/**
 * Documents that can be converted
 */
export const DOCUMENT_CONVERSION_MAP: Record<DocumentType, DocumentType[]> = {
  QUOTE: ["ORDER", "PROFORMA", "INVOICE"],
  PROFORMA: ["ORDER", "INVOICE"],
  ORDER: ["DELIVERY_NOTE", "INVOICE"],
  DELIVERY_NOTE: ["INVOICE"],
  INVOICE: ["CREDIT_NOTE"],
  CREDIT_NOTE: [],
  DEBIT_NOTE: [],
  SUPPLIER_ORDER: ["SUPPLIER_DELIVERY_NOTE"],
  SUPPLIER_DELIVERY_NOTE: ["SUPPLIER_INVOICE"],
  SUPPLIER_INVOICE: ["SUPPLIER_CREDIT_NOTE"],
  SUPPLIER_CREDIT_NOTE: [],
  SELF_INVOICE: [],
  ARCHIVED: [],
};

/**
 * Documents requiring customer
 */
export const DOCUMENTS_REQUIRING_CUSTOMER: readonly DocumentType[] = [
  "QUOTE",
  "PROFORMA",
  "ORDER",
  "DELIVERY_NOTE",
  "INVOICE",
  "CREDIT_NOTE",
  "DEBIT_NOTE",
] as const;

/**
 * Documents requiring supplier
 */
export const DOCUMENTS_REQUIRING_SUPPLIER: readonly DocumentType[] = [
  "SUPPLIER_ORDER",
  "SUPPLIER_INVOICE",
  "SUPPLIER_CREDIT_NOTE",
  "SUPPLIER_DELIVERY_NOTE",
] as const;

/**
 * Documents affecting stock
 */
export const DOCUMENTS_AFFECTING_STOCK: readonly DocumentType[] = [
  "ORDER",
  "DELIVERY_NOTE",
  "INVOICE",
  "CREDIT_NOTE",
  "SUPPLIER_ORDER",
  "SUPPLIER_DELIVERY_NOTE",
] as const;

// ============================================================================
// DOCUMENT LINES
// ============================================================================

/**
 * Document line types
 */
export const DOCUMENT_LINE_TYPES = {
  PRODUCT: "PRODUCT",
  SERVICE: "SERVICE",
  DISCOUNT: "DISCOUNT",
  SUBTOTAL: "SUBTOTAL",
  TEXT: "TEXT",
  PAGE_BREAK: "PAGE_BREAK",
} as const;

// ============================================================================
// INSTALLMENTS & PAYMENTS
// ============================================================================

/**
 * Payment installment statuses
 */
export const INSTALLMENT_STATUSES = {
  PENDING: "PENDING", // In attesa di pagamento
  PAID: "PAID", // Pagato completamente
  OVERDUE: "OVERDUE", // Scaduto
  CANCELLED: "CANCELLED", // Annullato
  PARTIAL: "PARTIAL", // Pagato parzialmente (opzionale)
} as const;

/**
 * Allowed status transitions for installments
 */
export const INSTALLMENT_STATUS_TRANSITIONS: Record<InstallmentStatus, InstallmentStatus[]> = {
  PENDING: ["PAID", "OVERDUE", "PARTIAL", "CANCELLED"],
  PARTIAL: ["PAID", "OVERDUE", "CANCELLED"],
  OVERDUE: ["PAID", "PARTIAL", "CANCELLED"],
  PAID: [], // Terminal state
  CANCELLED: [], // Terminal state
};

/**
 * Default payment terms in days
 */
export const DEFAULT_PAYMENT_TERMS = {
  IMMEDIATE: 0,
  NET_7: 7,
  NET_15: 15,
  NET_30: 30,
  NET_60: 60,
  NET_90: 90,
  END_OF_MONTH: 30,
  END_OF_MONTH_PLUS_30: 60,
} as const;

// ============================================================================
// VALIDATION LIMITS
// ============================================================================

export const MAX_DOCUMENT_LINES = 1000;
export const MAX_INSTALLMENTS = 12;
export const MAX_DISCOUNT_PERCENT = 100;
export const MIN_DISCOUNT_PERCENT = 0;
export const DEFAULT_VAT_PERCENT = 22;
export const MAX_LINE_QUANTITY = 999999.999999;
export const MAX_DOCUMENT_AMOUNT = 9999999999999.99;

// ============================================================================
// FINANCIAL SETTINGS
// ============================================================================

/**
 * Days to consider an invoice overdue for alerts
 */
export const OVERDUE_ALERT_DAYS = 7;

/**
 * Days before due date to send reminder
 */
export const REMINDER_DAYS_BEFORE_DUE = 3;

/**
 * Maximum reminders to send
 */
export const MAX_REMINDERS = 3;

/**
 * Days between reminders
 */
export const DAYS_BETWEEN_REMINDERS = 7;

// ============================================================================
// SORTING OPTIONS
// ============================================================================

export const DOCUMENT_SORT_OPTIONS = [
  "documentNumber",
  "documentDate",
  "dueDate",
  "totalAmount",
  "status",
  "customerName",
  "createdAt",
] as const;

export const DOCUMENT_LINE_SORT_OPTIONS = [
  "lineNumber",
  "code",
  "nameSystem",
  "quantity",
  "unitPrice",
  "lineTotal",
] as const;

export const INSTALLMENT_SORT_OPTIONS = [
  "installmentNumber",
  "dueDate",
  "amount",
  "status",
] as const;
