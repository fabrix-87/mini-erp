// ============================================================================
// BANK ACCOUNT CONSTANTS
// ============================================================================

/** Maximum number of bank accounts a single company can hold. */
export const MAX_BANK_ACCOUNTS_PER_COMPANY = 20;

export const DEFAULT_BANK_ACCOUNT_CURRENCY = "EUR" as const;

export const MAX_BANK_ACCOUNT_NAME_LENGTH = 100;
export const MAX_BANK_NAME_LENGTH = 100;
export const MAX_ACCOUNT_HOLDER_LENGTH = 255;
export const MAX_BANK_ACCOUNT_NOTE_LENGTH = 250;

/** IBAN length bounds (ISO 13616) and the fixed Italian length. */
export const IBAN_MIN_LENGTH = 15;
export const IBAN_MAX_LENGTH = 34;
export const ITALIAN_IBAN_LENGTH = 27;

/** BIC/SWIFT: 8 or 11 characters. */
export const BIC_PATTERN = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export const BANK_ACCOUNT_SORT_OPTIONS = ["name", "bankName", "isDefault", "createdAt"] as const;
