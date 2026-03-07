// ============================================================================
// DOCUMENT CONSTANTS
// ============================================================================

/**
 * Document types
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
} as const;

/**
 * Document status categories
 */
export const DOCUMENT_STATUS_CATEGORIES = {
  DRAFT_PHASE: "DRAFT_PHASE",
  APPROVAL_PHASE: "APPROVAL_PHASE",
  ACTIVE_PHASE: "ACTIVE_PHASE",
  FULFILLMENT_PHASE: "FULFILLMENT_PHASE",
  PAYMENT_PHASE: "PAYMENT_PHASE",
  CLOSED_PHASE: "CLOSED_PHASE",
} as const;

/**
 * Document statuses
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

/**
 * Document relation types
 */
export const DOCUMENT_RELATION_TYPES = {
  CONVERTS_TO: "CONVERTS_TO",
  SPLITS_FROM: "SPLITS_FROM",
  MERGES_INTO: "MERGES_INTO",
  CREDITS: "CREDITS",
  AMENDS: "AMENDS",
} as const;

/**
 * Document line types
 */
export const DOCUMENT_LINE_TYPES = {
  PRODUCT: "product",
  SERVICE: "service",
  DISCOUNT: "discount",
  SUBTOTAL: "subtotal",
  TEXT: "text",
  PAGE_BREAK: "page_break",
} as const;

/**
 * Payment installment statuses
 */
export const INSTALLMENT_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
} as const;

// ============================================================================
// DOCUMENT TYPE LABELS
// ============================================================================

export const DOCUMENT_TYPE_LABELS: Record<keyof typeof DOCUMENT_TYPES, string> =
  {
    QUOTE: "Preventivo",
    PROFORMA: "Proforma",
    ORDER: "Ordine Cliente",
    DELIVERY_NOTE: "Documento di Trasporto",
    INVOICE: "Fattura",
    CREDIT_NOTE: "Nota di Credito",
    DEBIT_NOTE: "Nota di Debito",
    SUPPLIER_ORDER: "Ordine Fornitore",
    ARCHIVED: "Archiviato",
  };

export const DOCUMENT_STATUS_LABELS: Record<
  keyof typeof DOCUMENT_STATUSES,
  string
> = {
  DRAFT: "Bozza",
  PENDING_APPROVAL: "In attesa approvazione",
  SENT: "Inviato",
  ACCEPTED: "Accettato",
  REJECTED: "Rifiutato",
  PREPARING: "In preparazione",
  PARTIALLY_FULFILLED: "Evasione parziale",
  FULFILLED: "Totalmente evaso",
  IN_TRANSIT: "In transito",
  DELIVERED: "Consegnato",
  UNPAID: "Non pagato",
  PARTIALLY_PAID: "Parzialmente pagato",
  PAID: "Pagato",
  OVERDUE: "Scaduto",
  VOIDED: "Annullato",
  CLOSED: "Chiuso",
};

// ============================================================================
// DOCUMENT WORKFLOWS
// ============================================================================

/**
 * Valid status transitions for each document type
 */
export const DOCUMENT_STATUS_TRANSITIONS: Record<
  keyof typeof DOCUMENT_TYPES,
  Partial<
    Record<keyof typeof DOCUMENT_STATUSES, (keyof typeof DOCUMENT_STATUSES)[]>
  >
> = {
  QUOTE: {
    DRAFT: ["PENDING_APPROVAL", "SENT", "VOIDED"],
    PENDING_APPROVAL: ["SENT", "DRAFT", "VOIDED"],
    SENT: ["ACCEPTED", "REJECTED", "CLOSED", "VOIDED"],
    ACCEPTED: ["CLOSED"],
    REJECTED: ["CLOSED", "VOIDED"],
  },
  PROFORMA: {
    DRAFT: ["PENDING_APPROVAL", "SENT", "VOIDED"],
    PENDING_APPROVAL: ["SENT", "DRAFT", "VOIDED"],
    SENT: ["ACCEPTED", "REJECTED", "CLOSED", "VOIDED"],
    ACCEPTED: ["CLOSED"],
    REJECTED: ["CLOSED", "VOIDED"],
  },
  ORDER: {
    DRAFT: ["PENDING_APPROVAL", "ACCEPTED", "VOIDED"],
    PENDING_APPROVAL: ["ACCEPTED", "REJECTED", "DRAFT", "VOIDED"],
    ACCEPTED: ["PREPARING", "VOIDED"],
    REJECTED: ["CLOSED", "VOIDED"],
    PREPARING: ["IN_TRANSIT", "DELIVERED", "ACCEPTED"],
    IN_TRANSIT: ["DELIVERED"],
    DELIVERED: ["CLOSED"],
  },
  DELIVERY_NOTE: {
    DRAFT: ["IN_TRANSIT", "VOIDED"],
    IN_TRANSIT: ["DELIVERED", "DRAFT"],
    DELIVERED: ["CLOSED"],
  },
  INVOICE: {
    DRAFT: ["PENDING_APPROVAL", "SENT", "VOIDED"],
    PENDING_APPROVAL: ["SENT", "DRAFT", "VOIDED"],
    SENT: ["UNPAID", "VOIDED"],
    UNPAID: ["PARTIALLY_PAID", "PAID", "OVERDUE", "VOIDED"],
    PARTIALLY_PAID: ["PAID", "OVERDUE"],
    OVERDUE: ["PARTIALLY_PAID", "PAID"],
    PAID: ["CLOSED"],
  },
  CREDIT_NOTE: {
    DRAFT: ["PENDING_APPROVAL", "SENT", "VOIDED"],
    PENDING_APPROVAL: ["SENT", "DRAFT", "VOIDED"],
    SENT: ["CLOSED"],
  },
  DEBIT_NOTE: {
    DRAFT: ["PENDING_APPROVAL", "SENT", "VOIDED"],
    PENDING_APPROVAL: ["SENT", "DRAFT", "VOIDED"],
    SENT: ["UNPAID", "VOIDED"],
    UNPAID: ["PAID", "OVERDUE"],
    OVERDUE: ["PAID"],
    PAID: ["CLOSED"],
  },
  SUPPLIER_ORDER: {
    DRAFT: ["SENT", "VOIDED"],
    SENT: ["ACCEPTED", "REJECTED", "VOIDED"],
    ACCEPTED: ["PREPARING", "DELIVERED"],
    PREPARING: ["DELIVERED"],
    DELIVERED: ["CLOSED"],
  },
  ARCHIVED: {},
};

/**
 * Documents that require customer
 */
export const DOCUMENTS_REQUIRING_CUSTOMER = [
  DOCUMENT_TYPES.QUOTE,
  DOCUMENT_TYPES.PROFORMA,
  DOCUMENT_TYPES.ORDER,
  DOCUMENT_TYPES.DELIVERY_NOTE,
  DOCUMENT_TYPES.INVOICE,
  DOCUMENT_TYPES.CREDIT_NOTE,
  DOCUMENT_TYPES.DEBIT_NOTE,
];

/**
 * Documents that require supplier
 */
export const DOCUMENTS_REQUIRING_SUPPLIER = [DOCUMENT_TYPES.SUPPLIER_ORDER];

/**
 * Document types as array (for validation)
 */
export const DOCUMENTS_REQUIRING_CUSTOMER_ARRAY = [
  DOCUMENT_TYPES.QUOTE,
  DOCUMENT_TYPES.PROFORMA,
  DOCUMENT_TYPES.ORDER,
  DOCUMENT_TYPES.DELIVERY_NOTE,
  DOCUMENT_TYPES.INVOICE,
  DOCUMENT_TYPES.CREDIT_NOTE,
  DOCUMENT_TYPES.DEBIT_NOTE,
] as const;

export const DOCUMENTS_REQUIRING_SUPPLIER_ARRAY = [
  DOCUMENT_TYPES.SUPPLIER_ORDER,
] as const;

/**
 * Documents that affect stock
 */
export const DOCUMENTS_AFFECTING_STOCK = [
  DOCUMENT_TYPES.ORDER,
  DOCUMENT_TYPES.DELIVERY_NOTE,
  DOCUMENT_TYPES.SUPPLIER_ORDER,
];

/**
 * Documents that can be converted
 */
export const DOCUMENT_CONVERSION_MAP: Record<
  keyof typeof DOCUMENT_TYPES,
  (keyof typeof DOCUMENT_TYPES)[]
> = {
  QUOTE: ["ORDER", "PROFORMA", "INVOICE"],
  PROFORMA: ["ORDER", "INVOICE"],
  ORDER: ["DELIVERY_NOTE", "INVOICE"],
  DELIVERY_NOTE: ["INVOICE"],
  INVOICE: ["CREDIT_NOTE"],
  CREDIT_NOTE: [],
  DEBIT_NOTE: [],
  SUPPLIER_ORDER: ["DELIVERY_NOTE"],
  ARCHIVED: [],
};

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const MAX_DOCUMENT_LINES = 1000;
export const MAX_INSTALLMENTS = 12;
export const MAX_DISCOUNT_PERCENT = 100;
export const MIN_DISCOUNT_PERCENT = 0;
export const DEFAULT_VAT_PERCENT = 22;
export const MAX_LINE_QUANTITY = 999999.999999;
export const MAX_DOCUMENT_AMOUNT = 9999999999999.99;

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
// DOCUMENT PREFIXES
// ============================================================================

export const DOCUMENT_NUMBER_PREFIXES: Record<
  keyof typeof DOCUMENT_TYPES,
  string
> = {
  QUOTE: "PVT",
  PROFORMA: "PRO",
  ORDER: "ORD",
  DELIVERY_NOTE: "DDT",
  INVOICE: "FT",
  CREDIT_NOTE: "NC",
  DEBIT_NOTE: "ND",
  SUPPLIER_ORDER: "ODF",
  ARCHIVED: "ARC",
};

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

// ============================================================================
// FINANCIAL CONSTANTS
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
