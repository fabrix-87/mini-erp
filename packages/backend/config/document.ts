// ============================================================================
// config/document.config.ts
// ============================================================================

/**
 * Configurazione numerazione documenti
 */
export const DOCUMENT_NUMBERING = {
  QUOTE: {
    prefix: 'QUOTE',
    startNumber: 1,
    digits: 4,
    resetOnNewYear: true,
  },
  PROFORMA: {
    prefix: 'PROF',
    startNumber: 1,
    digits: 4,
    resetOnNewYear: true,
  },
  ORDER: {
    prefix: 'ORD',
    startNumber: 1,
    digits: 4,
    resetOnNewYear: true,
  },
  DELIVERY_NOTE: {
    prefix: 'DDT',
    startNumber: 1,
    digits: 4,
    resetOnNewYear: true,
  },
  INVOICE: {
    prefix: 'FT',
    startNumber: 1,
    digits: 4,
    resetOnNewYear: true,
  },
  CREDIT_NOTE: {
    prefix: 'NC',
    startNumber: 1,
    digits: 4,
    resetOnNewYear: true,
  },
  DEBIT_NOTE: {
    prefix: 'ND',
    startNumber: 1,
    digits: 4,
    resetOnNewYear: true,
  },
  SUPPLIER_ORDER: {
    prefix: 'OA',
    startNumber: 1,
    digits: 4,
    resetOnNewYear: true,
  },
} as const;

/**
 * Workflow transizioni permesse
 */
export const DOCUMENT_STATUS_TRANSITIONS = {
  DRAFT: ['PENDING_APPROVAL', 'SENT', 'VOIDED'],
  PENDING_APPROVAL: ['DRAFT', 'SENT', 'REJECTED', 'VOIDED'],
  SENT: ['ACCEPTED', 'REJECTED', 'VOIDED'],
  ACCEPTED: ['PREPARING', 'VOIDED'],
  REJECTED: ['DRAFT', 'VOIDED'],
  PREPARING: ['IN_TRANSIT', 'VOIDED'],
  IN_TRANSIT: ['DELIVERED', 'VOIDED'],
  DELIVERED: ['UNPAID', 'VOIDED'],
  UNPAID: ['PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOIDED'],
  PARTIALLY_PAID: ['PAID', 'OVERDUE', 'VOIDED'],
  PAID: ['CLOSED'],
  OVERDUE: ['PARTIALLY_PAID', 'PAID', 'VOIDED'],
  VOIDED: [], // Terminale
  CLOSED: [], // Terminale
} as const;

/**
 * Stati che richiedono numero documento
 */
export const STATUSES_REQUIRING_NUMBER = [
  'SENT',
  'ACCEPTED',
  'REJECTED',
  'PREPARING',
  'IN_TRANSIT',
  'DELIVERED',
  'UNPAID',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'CLOSED',
];

/**
 * Tipi documento che generano movimenti magazzino
 */
export const DOCUMENT_TYPES_WITH_STOCK_MOVEMENTS = [
  'DELIVERY_NOTE',
  'INVOICE',
  'SUPPLIER_ORDER',
];

