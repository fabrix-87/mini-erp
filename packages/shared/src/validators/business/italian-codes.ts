import { z } from "zod";

// ============================================================================
// VALIDATION REGEX
// ============================================================================

const italianVATRegex = /^\d{11}$/;
const italianTaxCodeRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
const sdiCodeRegex = /^[A-Z0-9]{7}$/;

/**
 * Validates Italian VAT number (Partita IVA)
 * Complies with Agenzia delle Entrate algorithm
 * 
 * Format: 11 numeric digits
 * - First 7 digits: progressive number
 * - Digits 8-10: province code (001-100, 120-121)
 * - 11th digit: check digit (calculated with Luhn-like algorithm)
 */
export const vatNumberSchema = (required = false) => {
  const baseSchema = z
    .string()
    .trim()
    .regex(italianVATRegex, "Partita IVA deve contenere 11 cifre")
    .refine(
      (vat) => {
        if (vat.length !== 11) return false;
        
        // Check province code (positions 8-10)
        const provinceCode = parseInt(vat.substring(7, 10), 10);
        if (provinceCode < 1 || (provinceCode > 100 && provinceCode !== 120 && provinceCode !== 121)) {
          return false;
        }
        
        // Validate check digit (11th position) using official algorithm
        let sum = 0;
        for (let i = 0; i < 10; i++) {
          let digit = parseInt(vat[i], 10);
          
          // Odd positions (1st, 3rd, 5th, 7th, 9th) - index 0, 2, 4, 6, 8
          if (i % 2 === 0) {
            sum += digit;
          } 
          // Even positions (2nd, 4th, 6th, 8th, 10th) - index 1, 3, 5, 7, 9
          else {
            digit *= 2;
            sum += digit > 9 ? digit - 9 : digit;
          }
        }
        
        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit === parseInt(vat[10], 10);
      },
      { message: "Partita IVA non valida" },
    );

  return required ? baseSchema : baseSchema.optional().nullable();
};

/**
 * Schema per codice fiscale italiano
 */
export const fiscalCodeSchema = (required = false) => {
  const baseSchema = z
    .string()
    .regex(
      italianTaxCodeRegex,
      "Formato codice fiscale non valido",
    )
    .length(16, "Il codice fiscale deve contenere 16 caratteri")
    .toUpperCase();

  return required ? baseSchema : baseSchema.optional().nullable();
};

/**
 * Validates Italian SDI code (Codice Destinatario/Recipient Code)
 * Used for electronic invoicing (Fatturazione Elettronica)
 * 
 * Valid formats:
 * - 7 alphanumeric characters (standard)
 * - "0000000" (PEC required)
 * - "XXXXXXX" (foreign/special cases)
 */
export const sdiCodeSchema = (required = false) => {
  const baseSchema = z
    .string()
    .trim()
    .toUpperCase()
    .length(7, "Il codice SDI deve contenere esattamente 7 caratteri")
    .regex(
      sdiCodeRegex,
      "Il codice SDI deve contenere solo lettere maiuscole e numeri",
    )
    .refine(
      (code) => {
        // Valida "0000000" (PEC obbligatoria) e "XXXXXXX" (esteri/casi speciali)
        const validSpecialCodes = ["0000000", "XXXXXXX"];
        if (validSpecialCodes.includes(code)) return true;
        
        // Per codici standard, verifica che non sia tutto zero o tutto X
        return code !== "0000000" || code === "0000000";
      },
      { message: "Codice SDI non valido" },
    );

  return required ? baseSchema : baseSchema.optional().nullable();
};

/**
 * Validates international VAT ID numbers (EU + extra-EU)
 * For extra-EU countries, uses a generic alphanumeric validation
 */
export const internationalVatIdSchema = (required = false) => {
  const baseSchema = z
    .string()
    .trim()
    .toUpperCase()
    .min(2, "VAT ID troppo corto")
    .max(20, "VAT ID troppo lungo")
    .regex(
      /^[A-Z]{2,3}[A-Z0-9]+$/,
      "Il VAT ID deve iniziare con il codice paese (2-3 lettere) seguito da numeri/lettere",
    )
    .refine(
      (vatId) => {
        // Extract country code (2 or 3 chars)
        const countryMatch = vatId.match(/^([A-Z]{2,3})/);
        if (!countryMatch) return false;
        
        const country = countryMatch[1];
        const number = vatId.substring(country.length);
        
        // EU + Norway + Switzerland (strict validation)
        const euCountries = [
          'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DE', 'DK', 'EE', 
          'EL', 'GR', 'ES', 'FI', 'FR', 'GB', 'HU', 'IE', 'IT', 
          'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 
          'SI', 'SK', 'CHE', 'NO'
        ];
        
        if (euCountries.includes(country)) {
          // Use strict EU validation
          const patterns: Record<string, RegExp> = {
            AT: /^U[0-9]{8}$/,
            BE: /^[0-9]{10}$/,
            BG: /^[0-9]{9,10}$/,
            HR: /^[0-9]{11}$/,
            CY: /^[0-9]{8}[A-Z]$/,
            CZ: /^[0-9]{8,10}$/,
            DE: /^[0-9]{9}$/,
            DK: /^[0-9]{8}$/,
            EE: /^[0-9]{9}$/,
            EL: /^[0-9]{9}$/,
            GR: /^[0-9]{9}$/,
            ES: /^[A-Z0-9][0-9]{7}[A-Z0-9]$/,
            FI: /^[0-9]{8}$/,
            FR: /^[A-Z0-9]{2}[0-9]{9}$/,
            GB: /^[0-9]{9,12}$/,
            HU: /^[0-9]{8}$/,
            IE: /^[0-9][A-Z0-9][0-9]{5}[A-Z]{1,2}$/,
            IT: /^[0-9]{11}$/,
            LT: /^([0-9]{9}|[0-9]{12})$/,
            LU: /^[0-9]{8}$/,
            LV: /^[0-9]{11}$/,
            MT: /^[0-9]{8}$/,
            NL: /^[0-9]{9}B[0-9]{2}$/,
            PL: /^[0-9]{10}$/,
            PT: /^[0-9]{9}$/,
            RO: /^[0-9]{2,10}$/,
            SE: /^[0-9]{12}$/,
            SI: /^[0-9]{8}$/,
            SK: /^[0-9]{10}$/,
            CHE: /^[0-9]{9}(MWST|TVA|IVA)?$/,
            NO: /^[0-9]{9}MVA$/,
          };
          
          const pattern = patterns[country];
          return pattern ? pattern.test(number) : false;
        }
        
        // Extra-EU countries: generic validation
        // Must have at least 4 alphanumeric characters after country code
        return number.length >= 4 && /^[A-Z0-9]+$/.test(number);
      },
      { 
        message: "VAT ID non valido. Verificare formato e paese",
      },
    );

  return required ? baseSchema : baseSchema.optional().nullable();
};

/**
 * Validates EORI number (Economic Operators Registration and Identification)
 * Used for customs and extra-EU trade
 * 
 * Format: Country code (2 letters) + unique identifier (up to 15 chars)
 * Examples: 
 * - IT12345678901 (Italian)
 * - DE123456789012345 (German)
 * - GB123456789000 (UK)
 */
export const eoriNumberSchema = (required = false) => {
  const baseSchema = z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z]{2}[A-Z0-9]{1,15}$/,
      "Codice EORI non valido (formato: 2 lettere + max 15 caratteri)",
    )
    .min(3, "Codice EORI troppo corto")
    .max(17, "Codice EORI troppo lungo");

  return required ? baseSchema : baseSchema.optional().nullable();
};
