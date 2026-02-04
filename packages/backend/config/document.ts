// ============================================================================
// config/document.ts
// ============================================================================

import { DocumentType } from "@/generated/prisma/enums";

/**
 * Configurazione prefissi per numerazione documenti
 * Usata da DocumentSequence per generare documentNumber
 */
export const DOCUMENT_PREFIXES: Record<DocumentType, string> = {
  QUOTE: 'PRV',
  PROFORMA: 'PRO',
  ORDER: 'ORD',
  DELIVERY_NOTE: 'DDT',
  INVOICE: 'FT',
  CREDIT_NOTE: 'NC',
  DEBIT_NOTE: 'ND',
  SUPPLIER_ORDER: 'ODA',
  ARCHIVED: 'ARC',
} as const;

/**
 * Configurazione padding (numero cifre) per numerazione
 */
export const DOCUMENT_NUMBER_PADDING: Record<DocumentType, number> = {
  QUOTE: 4,
  PROFORMA: 4,
  ORDER: 5,
  DELIVERY_NOTE: 5,
  INVOICE: 5,
  CREDIT_NOTE: 5,
  DEBIT_NOTE: 5,
  SUPPLIER_ORDER: 5,
  ARCHIVED: 4,
} as const;

/**
 * Configurazione reset annuale per tipo documento
 * true = reset ogni anno (es. 1/2026, 1/2027)
 * false = numerazione continua (es. 1, 2, 3, ...)
 */
export const RESET_SEQUENCE_YEARLY: Record<DocumentType, boolean> = {
  QUOTE: true,
  PROFORMA: true,
  ORDER: true,
  DELIVERY_NOTE: true,
  INVOICE: true,
  CREDIT_NOTE: true,
  DEBIT_NOTE: true,
  SUPPLIER_ORDER: true,
  ARCHIVED: true,
} as const;

/**
 * Workflow transizioni permesse tra stati
 */
export const DOCUMENT_STATUS_TRANSITIONS = {
  DRAFT: ['PENDING_APPROVAL', 'SENT', 'VOIDED'],
  PENDING_APPROVAL: ['DRAFT', 'SENT', 'REJECTED', 'VOIDED'],
  SENT: ['ACCEPTED', 'REJECTED', 'VOIDED'],
  ACCEPTED: ['PREPARING', 'UNPAID', 'VOIDED'],
  REJECTED: ['DRAFT', 'VOIDED'],
  PREPARING: ['IN_TRANSIT', 'DELIVERED', 'VOIDED'],
  IN_TRANSIT: ['DELIVERED', 'VOIDED'],
  DELIVERED: ['UNPAID', 'VOIDED'],
  UNPAID: ['PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOIDED'],
  PARTIALLY_PAID: ['PAID', 'OVERDUE', 'VOIDED'],
  PAID: ['CLOSED'],
  OVERDUE: ['PARTIALLY_PAID', 'PAID', 'VOIDED'],
  VOIDED: [], // Stato terminale
  CLOSED: [], // Stato terminale
} as const;

/**
 * Stati che richiedono numero documento obbligatorio
 * Quando il documento transita in questi stati DEVE avere un numero
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
] as const;

/**
 * Stati in cui il documento rimane senza numero
 */
export const STATUSES_WITHOUT_NUMBER = [
  'DRAFT',
  'PENDING_APPROVAL',
] as const;

/**
 * Tipi documento che generano movimenti magazzino
 */
export const DOCUMENT_TYPES_WITH_STOCK_MOVEMENTS: DocumentType[] = [
  'DELIVERY_NOTE',
  'INVOICE',
  'SUPPLIER_ORDER',
] as const;

/**
 * Configurazione specifica per tipo documento
 */
export const DOCUMENT_TYPE_CONFIG: Record<
  DocumentType,
  {
    requiresCustomer: boolean;
    requiresSupplier: boolean;
    requiresWarehouse: boolean;
    canBeVoided: boolean;
    requiresPaymentMethod: boolean;
    allowNegativeQuantity: boolean;
    requiresEInvoicing: boolean; // Fatturazione elettronica
  }
> = {
  QUOTE: {
    requiresCustomer: true,
    requiresSupplier: false,
    requiresWarehouse: false,
    canBeVoided: false,
    requiresPaymentMethod: false,
    allowNegativeQuantity: false,
    requiresEInvoicing: false,
  },
  PROFORMA: {
    requiresCustomer: true,
    requiresSupplier: false,
    requiresWarehouse: false,
    canBeVoided: false,
    requiresPaymentMethod: true,
    allowNegativeQuantity: false,
    requiresEInvoicing: false,
  },
  ORDER: {
    requiresCustomer: true,
    requiresSupplier: false,
    requiresWarehouse: true,
    canBeVoided: true,
    requiresPaymentMethod: true,
    allowNegativeQuantity: false,
    requiresEInvoicing: false,
  },
  DELIVERY_NOTE: {
    requiresCustomer: true,
    requiresSupplier: false,
    requiresWarehouse: true,
    canBeVoided: false,
    requiresPaymentMethod: false,
    allowNegativeQuantity: false,
    requiresEInvoicing: false,
  },
  INVOICE: {
    requiresCustomer: true,
    requiresSupplier: false,
    requiresWarehouse: false,
    canBeVoided: true,
    requiresPaymentMethod: true,
    allowNegativeQuantity: false,
    requiresEInvoicing: true, // Fattura elettronica
  },
  CREDIT_NOTE: {
    requiresCustomer: true,
    requiresSupplier: false,
    requiresWarehouse: false,
    canBeVoided: true,
    requiresPaymentMethod: false,
    allowNegativeQuantity: true,
    requiresEInvoicing: true, // Fattura elettronica
  },
  DEBIT_NOTE: {
    requiresCustomer: true,
    requiresSupplier: false,
    requiresWarehouse: false,
    canBeVoided: true,
    requiresPaymentMethod: false,
    allowNegativeQuantity: false,
    requiresEInvoicing: true, // Fattura elettronica
  },
  SUPPLIER_ORDER: {
    requiresCustomer: false,
    requiresSupplier: true,
    requiresWarehouse: true,
    canBeVoided: true,
    requiresPaymentMethod: false,
    allowNegativeQuantity: false,
    requiresEInvoicing: false,
  },
  ARCHIVED: {
    requiresCustomer: false,
    requiresSupplier: false,
    requiresWarehouse: false,
    canBeVoided: false,
    requiresPaymentMethod: false,
    allowNegativeQuantity: false,
    requiresEInvoicing: false,
  },
} as const;

/**
 * Categorie di stato per UI
 */
export const STATUS_CATEGORIES = {
  DRAFT_PHASE: ['DRAFT', 'PENDING_APPROVAL'],
  APPROVAL_PHASE: ['SENT'],
  ACTIVE_PHASE: ['ACCEPTED', 'REJECTED'],
  FULFILLMENT_PHASE: ['PREPARING', 'IN_TRANSIT', 'DELIVERED'],
  PAYMENT_PHASE: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'],
  CLOSED_PHASE: ['VOIDED', 'CLOSED'],
} as const;
