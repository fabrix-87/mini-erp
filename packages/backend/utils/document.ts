// ============================================================================
// utils/document.ts
// ============================================================================


import { DocumentType, Prisma, PrismaClient } from '@/generated/prisma/client';
import {
  DOCUMENT_PREFIXES,
  DOCUMENT_NUMBER_PADDING,
  DOCUMENT_STATUS_TRANSITIONS,
  STATUSES_REQUIRING_NUMBER,
  DOCUMENT_TYPES_WITH_STOCK_MOVEMENTS,
  DOCUMENT_TYPE_CONFIG,
} from '../config/document';

export type StatusType = keyof typeof DOCUMENT_STATUS_TRANSITIONS;

// ============================================================================
// GENERAZIONE NUMERO DOCUMENTO (usando DocumentSequence)
// ============================================================================

/**
 * Risultato della generazione numero documento
 */
export interface GeneratedDocumentNumber {
  sequenceNumber: number;
  documentNumber: string;
  year: number;
  prefix: string;
}

/**
 * Genera il numero documento in modo atomico usando DocumentSequence
 * 
 * IMPORTANTE: Questa funzione DEVE essere chiamata dentro una transaction!
 * 
 * @param documentType - Tipo di documento (INVOICE, ORDER, ecc.)
 * @param year - Anno di riferimento (default: anno corrente)
 * @param tx - Transaction Prisma Client
 * @returns Oggetto con sequenceNumber e documentNumber
 * 
 * @example
 * ```typescript
 * await prisma.$transaction(async (tx) => {
 *   const numbering = await generateDocumentNumber('INVOICE', 2026, tx);
 *   // { sequenceNumber: 123, documentNumber: "FT/2026/00123", year: 2026, prefix: "FT" }
 *   
 *   await tx.document.update({
 *     where: { id: documentId },
 *     data: {
 *       sequenceNumber: numbering.sequenceNumber,
 *       documentNumber: numbering.documentNumber
 *     }
 *   });
 * });
 * ```
 */
export async function generateDocumentNumber(
  documentType: DocumentType,
  year: number,
  tx: Prisma.TransactionClient
): Promise<GeneratedDocumentNumber> {
  
  const prefix = DOCUMENT_PREFIXES[documentType];
  const padding = DOCUMENT_NUMBER_PADDING[documentType];

  // 1. Trova o crea sequenza per questo tipo+anno
  let sequence = await tx.documentSequence.findUnique({
    where: {
      documentType_year: {
        documentType,
        year,
      },
    },
  });

  if (!sequence) {
    // Crea nuova sequenza (primo documento dell'anno per questo tipo)
    sequence = await tx.documentSequence.create({
      data: {
        documentType,
        year,
        lastNumber: 0,
        prefix,
      },
    });
  }

  // 2. Incrementa atomicamente il numero
  const updated = await tx.documentSequence.update({
    where: { id: sequence.id },
    data: {
      lastNumber: { increment: 1 },
    },
  });

  // 3. Costruisci il numero documento completo
  const sequenceNumber = updated.lastNumber;
  const paddedNumber = sequenceNumber.toString().padStart(padding, '0');
  const documentNumber = `${prefix}/${year}/${paddedNumber}`;

  return {
    sequenceNumber,
    documentNumber,
    year,
    prefix,
  };
}

/**
 * Assegna numero a un documento in DRAFT
 * Usa questa funzione quando approvi/invii un documento
 * 
 * @param documentId - ID del documento
 * @param prisma - PrismaClient
 * @returns Documento aggiornato con numero
 */
export async function assignDocumentNumber(
  documentId: number,
  prisma: PrismaClient
) {
  return prisma.$transaction(async (tx) => {
    // 1. Recupera documento
    const document = await tx.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Documento ${documentId} non trovato`);
    }

    // 2. Verifica che sia in bozza
    if (document.documentNumber) {
      throw new Error('Documento già numerato');
    }

    if (!['DRAFT', 'PENDING_APPROVAL'].includes(document.status)) {
      throw new Error('Solo bozze possono essere numerate');
    }

    // 3. Genera numero
    const numbering = await generateDocumentNumber(
      document.documentType,
      document.documentYear,
      tx
    );

    // 4. Aggiorna documento
    return tx.document.update({
      where: { id: documentId },
      data: {
        sequenceNumber: numbering.sequenceNumber,
        documentNumber: numbering.documentNumber,
        approvedAt: new Date(),
      },
    });
  });
}

// ============================================================================
// UTILITY FUNZIONI 
// ============================================================================

/**
 * Verifica se transizione status è permessa
 */
export const isStatusTransitionAllowed = (
  currentStatus: StatusType,
  newStatus: string
): boolean => {
  const allowedTransitions = DOCUMENT_STATUS_TRANSITIONS[currentStatus] as readonly string[];
  return allowedTransitions.includes(newStatus);
};

/**
 * Formatta numero documento (DEPRECATO - usa generateDocumentNumber)
 * @deprecated Usa generateDocumentNumber() invece
 */
export const formatDocumentNumber = (
  documentType: DocumentType,
  year: number,
  sequentialNumber: number
): string => {
  const prefix = DOCUMENT_PREFIXES[documentType];
  const padding = DOCUMENT_NUMBER_PADDING[documentType];
  const paddedNumber = sequentialNumber.toString().padStart(padding, '0');
  return `${prefix}/${year}/${paddedNumber}`;
};

/**
 * Parse numero documento
 */
export const parseDocumentNumber = (
  documentNumber: string
): { prefix: string; year: number; number: number } | null => {
  const parts = documentNumber.split('/'); // Cambiato da "-" a "/"

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
  const vat = vatNumber.replace(/^IT/, '');

  if (!/^\d{11}$/.test(vat)) {
    return false;
  }

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
export const isDocumentDeletable = (
  status: string,
  hasNumber: boolean
): boolean => {
  return status === 'DRAFT' && !hasNumber;
};

/**
 * Verifica se documento può essere numerato
 */
export const canBeNumbered = (status: string, hasNumber: boolean): boolean => {
  return ['DRAFT', 'PENDING_APPROVAL'].includes(status) && !hasNumber;
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
export const validateInstallments = (
  installments: any[]
): {
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
    let dueDate = new Date(documentDate);

    if (detail.termType === 'days_from_invoice') {
      dueDate.setDate(dueDate.getDate() + detail.dueDays);
    } else if (detail.termType === 'end_of_month') {
      dueDate.setMonth(dueDate.getMonth() + 1);
      dueDate.setDate(0);
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
  documentType: DocumentType,
  customerCountryCode: string
): boolean => {
  const config = DOCUMENT_TYPE_CONFIG[documentType];
  return config.requiresEInvoicing && customerCountryCode === 'IT';
};

/**
 * Estrai tipo documento per SDI (Fattura Elettronica)
 */
export const getSDIDocumentType = (documentType: DocumentType): string => {
  const sdiTypes: Record<string, string> = {
    INVOICE: 'TD01',
    CREDIT_NOTE: 'TD04',
    DEBIT_NOTE: 'TD05',
  };

  return sdiTypes[documentType] || 'TD01';
};

/**
 * Validazione campi obbligatori per fattura elettronica
 */
export const validateEInvoiceRequirements = (
  document: any
): {
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
  DOCUMENT_PREFIXES,
  DOCUMENT_NUMBER_PADDING,
  DOCUMENT_STATUS_TRANSITIONS,
  STATUSES_REQUIRING_NUMBER,
  DOCUMENT_TYPES_WITH_STOCK_MOVEMENTS,
  DOCUMENT_TYPE_CONFIG,
};
