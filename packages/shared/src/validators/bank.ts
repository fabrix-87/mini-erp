import { z } from "zod";
import {
  bankAccountIdBaseSchema,
  currencyCodeBaseSchema,
  customerIdBaseSchema,
  supplierIdBaseSchema,
} from "./base";
import { bicSchema, ibanSchema } from "./business/bank-codes";
import { emptyStringToNull } from "./primitives/string";
import { limitSchema, pageSchema, sortOrderSchema } from "./query/pagination";
import { queryBooleanOrAllSchema } from "./query/params";
import {
  BANK_ACCOUNT_SORT_OPTIONS,
  DEFAULT_BANK_ACCOUNT_CURRENCY,
  MAX_ACCOUNT_HOLDER_LENGTH,
  MAX_BANK_ACCOUNT_NAME_LENGTH,
  MAX_BANK_ACCOUNT_NOTE_LENGTH,
  MAX_BANK_ACCOUNTS_PER_COMPANY,
  MAX_BANK_NAME_LENGTH,
} from "../constants/bank";

// ============================================================================
// SORT
// ============================================================================

export const bankAccountSortFieldSchema = z.enum(BANK_ACCOUNT_SORT_OPTIONS);

// ============================================================================
// BASE + CREATE / UPDATE
// ============================================================================

/**
 * Raw BankAccount shape — WITHOUT defaults (currencyCode, active, isDefault), so the
 * update schema built from .partial() never resets them on a partial payload.
 * The owner company is never part of the body: it is resolved from the parent route
 * (customer, supplier or tenant).
 */
const bankAccountShape = z.object({
  /** Internal label, e.g. "Conto principale EUR". */
  name: z
    .string()
    .trim()
    .min(1, "Nome conto obbligatorio")
    .max(MAX_BANK_ACCOUNT_NAME_LENGTH, `Nome max ${MAX_BANK_ACCOUNT_NAME_LENGTH} caratteri`),
  bankName: z
    .string()
    .trim()
    .min(1, "Nome banca obbligatorio")
    .max(MAX_BANK_NAME_LENGTH, `Nome banca max ${MAX_BANK_NAME_LENGTH} caratteri`),
  iban: ibanSchema,
  bic: bicSchema,
  /** Account holder, only when different from the company legal name. */
  accountHolder: emptyStringToNull(
    z
      .string()
      .trim()
      .max(MAX_ACCOUNT_HOLDER_LENGTH, `Titolare max ${MAX_ACCOUNT_HOLDER_LENGTH} caratteri`),
  ).nullish(),
  currencyCode: currencyCodeBaseSchema,
  note: emptyStringToNull(
    z
      .string()
      .trim()
      .max(MAX_BANK_ACCOUNT_NOTE_LENGTH, `Note max ${MAX_BANK_ACCOUNT_NOTE_LENGTH} caratteri`),
  ).nullish(),
  active: z.boolean(),
  isDefault: z.boolean(),
});

/**
 * Schema for creating a BankAccount.
 * A default account must be active; "one default per currency" across the stored accounts
 * is enforced by the controller inside a transaction.
 */
export const createBankAccountSchema = bankAccountShape
  .extend({
    currencyCode: currencyCodeBaseSchema.default(DEFAULT_BANK_ACCOUNT_CURRENCY),
    active: z.boolean().default(true),
    isDefault: z.boolean().default(false),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.isDefault && !data.active) {
      ctx.addIssue({
        code: "custom",
        message: "Un conto predefinito deve essere attivo",
        path: ["isDefault"],
      });
    }
  });

/**
 * Schema for updating a BankAccount — all fields optional, no defaults injected.
 * `iban` is immutable: to change it, create a new account and deactivate the old one,
 * so the change leaves an audit trail (see Document.bankDetailsMismatch).
 * The default/active consistency is validated by the controller against the stored state.
 */
export const updateBankAccountSchema = bankAccountShape.omit({ iban: true }).partial().strict();

// ============================================================================
// NESTED (company create flows)
// ============================================================================

/**
 * Bank accounts submitted together with a new customer or supplier.
 * Validates IBAN uniqueness and a single default per currency inside the array.
 * Accounts of an existing company are managed through the sub-resource endpoints instead.
 */
export const nestedBankAccountsSchema = z
  .array(createBankAccountSchema)
  .max(MAX_BANK_ACCOUNTS_PER_COMPANY, `Massimo ${MAX_BANK_ACCOUNTS_PER_COMPANY} conti`)
  .superRefine((accounts, ctx) => {
    const ibans = new Set<string>();
    const defaultCurrencies = new Set<string>();

    accounts.forEach((account, index) => {
      if (ibans.has(account.iban)) {
        ctx.addIssue({ code: "custom", message: "IBAN duplicato", path: [index, "iban"] });
      }
      ibans.add(account.iban);

      if (account.isDefault) {
        if (defaultCurrencies.has(account.currencyCode)) {
          ctx.addIssue({
            code: "custom",
            message: "Un solo conto predefinito per valuta",
            path: [index, "isDefault"],
          });
        }
        defaultCurrencies.add(account.currencyCode);
      }
    });
  });

// ============================================================================
// ID PARAMS
// ============================================================================

/** Tenant route: the owner company is resolved from the authenticated tenant. */
export const bankAccountIdParamSchema = z.object({
  bankAccountId: bankAccountIdBaseSchema,
});

export const customerBankAccountsParamSchema = z.object({ id: customerIdBaseSchema });
export const customerBankAccountParamSchema = customerBankAccountsParamSchema.extend({
  bankAccountId: bankAccountIdBaseSchema,
});

export const supplierBankAccountsParamSchema = z.object({ id: supplierIdBaseSchema });
export const supplierBankAccountParamSchema = supplierBankAccountsParamSchema.extend({
  bankAccountId: bankAccountIdBaseSchema,
});

// ============================================================================
// QUERY
// ============================================================================

/** Filters for the accounts of ONE company (the company comes from the parent route). */
export const bankAccountQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().trim().optional(),
  currencyCode: currencyCodeBaseSchema.optional(),
  active: queryBooleanOrAllSchema(),
  isDefault: queryBooleanOrAllSchema(),
  sortBy: bankAccountSortFieldSchema.default("name"),
  sortOrder: sortOrderSchema,
});

// ============================================================================
// SPECIAL SCHEMAS
// ============================================================================

export const toggleBankAccountActiveSchema = z.object({ active: z.boolean() }).strict();

/**
 * Looks up other accounts with the same IBAN (anti-fraud check at document registration).
 * Synchronous schema only: the lookup itself is a normal read endpoint, not an async refine.
 */
export const checkIbanSchema = z.object({
  iban: ibanSchema,
  excludeId: bankAccountIdBaseSchema.optional(),
});