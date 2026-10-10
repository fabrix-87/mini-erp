// ============================================================================
// BANK HELPERS (SHARED)
// IBAN utilities usable in both frontend and backend
// ============================================================================

import { IBAN_MAX_LENGTH, IBAN_MIN_LENGTH, ITALIAN_IBAN_LENGTH } from "../constants/bank";

/**
 * Normalizes an IBAN: removes every whitespace and upper-cases it.
 *
 * @param iban - Raw IBAN as typed by the user (e.g. "it60 X054 2811 1010 0000 0123 456")
 * @returns Compact upper-case IBAN
 */
export const normalizeIban = (iban: string): string => iban.replace(/\s+/g, "").toUpperCase();

/**
 * Validates an IBAN: structure, Italian length and ISO 7064 mod-97 checksum.
 * The input is normalized first, so spaced and lower-case values are accepted.
 *
 * @param iban - IBAN to validate
 * @returns true when the IBAN is structurally and arithmetically valid
 */
export const isValidIban = (iban: string): boolean => {
  const value = normalizeIban(iban);

  if (value.length < IBAN_MIN_LENGTH || value.length > IBAN_MAX_LENGTH) return false;
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(value)) return false;
  if (value.startsWith("IT") && value.length !== ITALIAN_IBAN_LENGTH) return false;

  // Move the first 4 characters to the end, map letters to 10–35, then mod 97 === 1.
  // The remainder is accumulated digit by digit to avoid BigInt.
  const rearranged = value.slice(4) + value.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const digits = /[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char;
    for (const digit of digits) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }
  return remainder === 1;
};

/**
 * Formats an IBAN in groups of four characters for display.
 *
 * @param iban - IBAN in any spacing
 * @returns e.g. "IT60 X054 2811 1010 0000 0123 456"
 */
export const formatIban = (iban: string): string =>
  normalizeIban(iban).replace(/(.{4})(?=.)/g, "$1 ");

/**
 * Masks an IBAN for lists and logs, keeping the country code and the last four characters.
 *
 * @param iban - IBAN in any spacing
 * @returns e.g. "IT••••••••••••••••••••3456"
 */
export const maskIban = (iban: string): string => {
  const value = normalizeIban(iban);
  if (value.length <= 6) return value;
  return `${value.slice(0, 2)}${"•".repeat(value.length - 6)}${value.slice(-4)}`;
};