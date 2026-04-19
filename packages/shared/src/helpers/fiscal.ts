// ============================================================================
// FISCAL HELPERS (SHARED)
// Italian fiscal validation utilities
// Can be used in both frontend and backend
// ============================================================================

import Decimal from "decimal.js";

/**
 * Validate Italian VAT number (Partita IVA)
 */
export const isValidItalianVAT = (vatNumber: string): boolean => {
  const vat = vatNumber.replace(/^IT/, "").replace(/\s/g, "");

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
 * Validate Italian Tax Code (Codice Fiscale)
 */
export const isValidItalianTaxCode = (taxCode: string): boolean => {
  const regex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
  return regex.test(taxCode.toUpperCase().replace(/\s/g, ""));
};

/**
 * Format Italian VAT number
 */
export const formatItalianVAT = (vatNumber: string): string => {
  const vat = vatNumber.replace(/^IT/, "").replace(/\s/g, "");
  if (vat.length === 11) {
    return `IT${vat}`;
  }
  return vatNumber;
};

/**
 * Format Italian Tax Code
 */
export const formatItalianTaxCode = (taxCode: string): string => {
  return taxCode.toUpperCase().replace(/\s/g, "");
};

/**
 * Determines if a company is VAT exempt based on its assigned TaxRule.
 * Exemption is derived from the tax rule (rate = 0 + vatNature) rather
 * than stored as a flag on the company itself.
 */
export const isVatExempt = (taxRule?: {
  rate: Decimal;
  vatNatureId: number | null;
}): boolean => {
  if (!taxRule) return false;
  return Number(taxRule.rate) === 0 && taxRule.vatNatureId !== null;
};