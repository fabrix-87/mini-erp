// ============================================================================
// DOCUMENT VALIDATION SERVICE
// Business validation rules for documents
// ============================================================================

import {
  DOCUMENT_STATUS_TRANSITIONS,
  DOCUMENT_TYPE_CONFIG,
  DocumentType,
} from "@mini-erp/shared";

export type StatusType = keyof typeof DOCUMENT_STATUS_TRANSITIONS;

/**
 * Verifica se transizione status è permessa
 */
export const isStatusTransitionAllowed = (
  currentStatus: StatusType,
  newStatus: string,
): boolean => {
  const allowedTransitions = DOCUMENT_STATUS_TRANSITIONS[
    currentStatus
  ] as readonly string[];
  return allowedTransitions.includes(newStatus);
};

/**
 * Verifica se documento è modificabile
 */
export const isDocumentEditable = (status: string): boolean => {
  return ["DRAFT", "PENDING_APPROVAL"].includes(status);
};

/**
 * Verifica se documento può essere eliminato
 */
export const isDocumentDeletable = (
  status: string,
  hasNumber: boolean,
): boolean => {
  return status === "DRAFT" && !hasNumber;
};

/**
 * Verifica se documento può essere numerato
 */
export const canBeNumbered = (status: string, hasNumber: boolean): boolean => {
  return ["DRAFT", "PENDING_APPROVAL"].includes(status) && !hasNumber;
};

/**
 * Verifica completezza rate (devono sommare 100%)
 */
export const validateInstallments = (
  installments: any[],
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
 * Verifica se documento richiede fatturazione elettronica
 */
export const requiresEInvoicing = (
  documentType: DocumentType,
  customerCountryCode: string,
): boolean => {
  const config = DOCUMENT_TYPE_CONFIG[documentType];
  return config.requiresEInvoicing && customerCountryCode === "IT";
};

/**
 * Validazione campi obbligatori per fattura elettronica
 */
export const validateEInvoiceRequirements = (
  document: any,
): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!document.customerVatNumber && !document.customerTaxCode) {
    errors.push("P.IVA o Codice Fiscale obbligatorio");
  }

  if (!document.customerSdiCode && !document.customerPec) {
    errors.push("Codice SDI o PEC obbligatorio");
  }

  if (!document.customerAddress) {
    errors.push("Indirizzo cliente obbligatorio");
  }

  if (!document.customerCity) {
    errors.push("Città cliente obbligatoria");
  }

  if (!document.customerPostalCode) {
    errors.push("CAP cliente obbligatorio");
  }

  if (!document.customerProvince) {
    errors.push("Provincia cliente obbligatoria");
  }

  if (document.lines.length === 0) {
    errors.push("Almeno una riga obbligatoria");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Estrai tipo documento per SDI (Fattura Elettronica)
 */
export const getSDIDocumentType = (documentType: DocumentType): string => {
  const sdiTypes: Record<string, string> = {
    INVOICE: "TD01",
    CREDIT_NOTE: "TD04",
    DEBIT_NOTE: "TD05",
  };

  return sdiTypes[documentType] || "TD01";
};
