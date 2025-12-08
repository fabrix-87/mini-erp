// ============================================================================
// utils/document.utils.ts
// ============================================================================

import { DOCUMENT_NUMBERING, DOCUMENT_STATUS_TRANSITIONS } from '../config/document.config';

/**
 * Verifica se transizione status è permessa
 */
export const isStatusTransitionAllowed = (
  currentStatus: string,
  newStatus: string
): boolean => {
  const allowedTransitions = DOCUMENT_STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
};

/**
 * Formatta numero documento secondo configurazione
 */
export const formatDocumentNumber = (
  documentType: string,
  year: number,
  sequentialNumber: number
): string => {
  const config = DOCUMENT_NUMBERING[documentType];
  
  if (!config) {
    throw new Error(`Configurazione numerazione mancante per ${documentType}`);
  }

  const paddedNumber = sequentialNumber.toString().padStart(config.digits, '0');
  return `${config.prefix}-${year}-${paddedNumber}`;
};

/**
 * Parse numero documento
 */
export const parseDocumentNumber = (
  documentNumber: string
): { prefix: string; year: number; number: number } | null => {
  const parts = documentNumber.split('-');
  
  if (parts.length !== 3) {
    return null;
  }

  return {
    prefix: parts[0],
    year: parseInt(parts[1], 10),
    number: parseInt(parts[2], 10),
  };
};

/**
 * Calcola IVA da imponibile
 */
export const calculateTax = (
  taxableAmount: number,
  taxPercent: number
): number => {
  return (taxableAmount * taxPercent) / 100;
};

/**
 * Calcola sconto da percentuale
 */
export const calculateDiscount = (
  amount: number,
  discountPercent: number
): number => {
  return (amount * discountPercent) / 100;
};

/**
 * Verifica validità P.IVA italiana
 */
export const isValidItalianVAT = (vatNumber: string): boolean => {
  // Rimuovi prefisso IT se presente
  const vat = vatNumber.replace(/^IT/, '');
  
  // Deve essere 11 cifre
  if (!/^\d{11}$/.test(vat)) {
    return false;
  }

  // Algoritmo checksum P.IVA italiana
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let digit = parseInt(vat.charAt(i), 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(vat.charAt(10), 10);
};

/**
 * Verifica validità Codice Fiscale italiano
 */
export const isValidItalianTaxCode = (taxCode: string): boolean => {
  const regex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
  return regex.test(taxCode.toUpperCase());
};

/**
 * Genera descrizione stato documento
 */
export const getStatusDescription = (status: string): string => {
  const descriptions: Record<string, string> = {
    DRAFT: 'Bozza',
    PENDING_APPROVAL: 'In attesa di approvazione',
    SENT: 'Inviato',
    ACCEPTED: 'Accettato',
    REJECTED: 'Rifiutato',
    PREPARING: 'In preparazione',
    IN_TRANSIT: 'In transito',
    DELIVERED: 'Consegnato',
    UNPAID: 'Non pagato',
    PARTIALLY_PAID: 'Parzialmente pagato',
    PAID: 'Pagato',
    OVERDUE: 'Scaduto',
    VOIDED: 'Annullato',
    CLOSED: 'Chiuso',
  };

  return descriptions[status] || status;
};

/**
 * Genera colore badge status (per UI)
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    DRAFT: 'gray',
    PENDING_APPROVAL: 'yellow',
    SENT: 'blue',
    ACCEPTED: 'green',
    REJECTED: 'red',
    PREPARING: 'purple',
    IN_TRANSIT: 'indigo',
    DELIVERED: 'green',
    UNPAID: 'orange',
    PARTIALLY_PAID: 'yellow',
    PAID: 'green',
    OVERDUE: 'red',
    VOIDED: 'gray',
    CLOSED: 'gray',
  };

  return colors[status] || 'gray';
};

/**
 * Calcola giorni scadenza
 */
export const getDaysUntilDue = (dueDate: Date): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Verifica se documento è modificabile
 */
export const isDocumentEditable = (status: string): boolean => {
  return ['DRAFT', 'PENDING_APPROVAL'].includes(status);
};

/**
 * Verifica se documento può essere eliminato
 */
export const isDocumentDeletable = (status: string, hasNumber: boolean): boolean => {
  return status === 'DRAFT' && !hasNumber;
};

/**
 * Genera riferimento pagamento univoco
 */
export const generatePaymentReference = (
  documentNumber: string,
  installmentNumber: number
): string => {
  return `${documentNumber}/R${installmentNumber}`;
};

/**
 * Formatta importo valuta
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'EUR',
  locale: string = 'it-IT'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Calcola totale rate
 */
export const calculateInstallmentTotal = (installments: any[]): number => {
  return installments.reduce((sum, inst) => sum + Number(inst.amount), 0);
};

/**
 * Verifica completezza rate (devono sommare 100%)
 */
export const validateInstallments = (installments: any[]): {
  valid: boolean;
  totalPercentage: number;
} => {
  const totalPercentage = installments.reduce(
    (sum, inst) => sum + Number(inst.percentage),
    0
  );

  return {
    valid: Math.abs(totalPercentage - 100) < 0.01,
    totalPercentage,
  };
};

/**
 * Genera scadenze da payment method
 */
export const generateInstallmentsFromPaymentMethod = (
  totalAmount: number,
  paymentMethod: any,
  documentDate: Date
): any[] => {
  if (!paymentMethod?.details || paymentMethod.details.length === 0) {
    // Pagamento singolo immediato
    return [
      {
        installmentNumber: 1,
        percentage: 100,
        amount: totalAmount,
        dueDate: documentDate,
      },
    ];
  }

  return paymentMethod.details.map((detail: any, index: number) => {
    // Calcola data scadenza in base a termType
    let dueDate = new Date(documentDate);

    if (detail.termType === 'days_from_invoice') {
      dueDate.setDate(dueDate.getDate() + detail.dueDays);
    } else if (detail.termType === 'end_of_month') {
      dueDate.setMonth(dueDate.getMonth() + 1);
      dueDate.setDate(0); // Ultimo giorno del mese
      dueDate.setDate(dueDate.getDate() + detail.dueDays);
    }

    return {
      installmentNumber: index + 1,
      percentage: Number(detail.percentage),
      amount: (totalAmount * Number(detail.percentage)) / 100,
      dueDate,
    };
  });
};

/**
 * Verifica se documento richiede fatturazione elettronica
 */
export const requiresEInvoicing = (
  documentType: string,
  customerCountryCode: string
): boolean => {
  // Solo fatture e note di credito/debito
  if (!['INVOICE', 'CREDIT_NOTE', 'DEBIT_NOTE'].includes(documentType)) {
    return false;
  }

  // Solo per Italia
  return customerCountryCode === 'IT';
};

/**
 * Estrai tipo documento per SDI (Fattura Elettronica)
 */
export const getSDIDocumentType = (documentType: string): string => {
  const sdiTypes: Record<string, string> = {
    INVOICE: 'TD01', // Fattura
    CREDIT_NOTE: 'TD04', // Nota di credito
    DEBIT_NOTE: 'TD05', // Nota di debito
  };

  return sdiTypes[documentType] || 'TD01';
};

/**
 * Validazione campi obbligatori per fattura elettronica
 */
export const validateEInvoiceRequirements = (document: any): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!document.customerVatNumber && !document.customerTaxCode) {
    errors.push('P.IVA o Codice Fiscale obbligatorio');
  }

  if (!document.customerSdiCode && !document.customerPec) {
    errors.push('Codice SDI o PEC obbligatorio');
  }

  if (!document.customerAddress) {
    errors.push('Indirizzo cliente obbligatorio');
  }

  if (!document.customerCity) {
    errors.push('Città cliente obbligatoria');
  }

  if (!document.customerPostalCode) {
    errors.push('CAP cliente obbligatorio');
  }

  if (!document.customerProvince) {
    errors.push('Provincia cliente obbligatoria');
  }

  if (document.lines.length === 0) {
    errors.push('Almeno una riga obbligatoria');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// EXPORT
// ============================================================================

export {
  DOCUMENT_NUMBERING,
  DOCUMENT_STATUS_TRANSITIONS,
  STATUSES_REQUIRING_NUMBER,
  DOCUMENT_TYPES_WITH_STOCK_MOVEMENTS,
};