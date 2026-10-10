// ============================================================================
// BANK ACCOUNT TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import type { Company } from "./company";
import type { Currency } from "./currency";
import {
  bankAccountIdParamSchema,
  bankAccountQuerySchema,
  checkIbanSchema,
  createBankAccountSchema,
  customerBankAccountParamSchema,
  customerBankAccountsParamSchema,
  nestedBankAccountsSchema,
  supplierBankAccountParamSchema,
  supplierBankAccountsParamSchema,
  toggleBankAccountActiveSchema,
  updateBankAccountSchema,
} from "../validators/bank";

// ENTITY TYPES

/**
 * Bank account owned by the tenant or by a counterparty company.
 */
export type BankAccount = {
  id: string;
  tenantId: string;
  /** Owner company (the tenant's own company, a customer's or a supplier's). */
  companyId: string | null;
  company?: Company | null;
  name: string;
  bankName: string;
  iban: string;
  bic: string | null;
  accountHolder: string | null;
  currencyCode: string;
  currency?: Currency;
  note: string | null;
  active: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Slim account for selects (payment method default account, document bank snapshot). */
export type BankAccountListItem = Pick<
  BankAccount,
  "id" | "name" | "bankName" | "iban" | "currencyCode" | "active" | "isDefault" | "companyId"
>;

// INPUT TYPES
export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
export type CreateBankAccountFormValues = z.input<typeof createBankAccountSchema>;
export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>;
export type UpdateBankAccountFormValues = z.input<typeof updateBankAccountSchema>;
export type ToggleBankAccountActiveInput = z.infer<typeof toggleBankAccountActiveSchema>;
export type CheckIbanInput = z.infer<typeof checkIbanSchema>;

// PARAM TYPES
export type BankAccountQueryInput = z.infer<typeof bankAccountQuerySchema>;
export type BankAccountIdParam = z.infer<typeof bankAccountIdParamSchema>;
export type CustomerBankAccountsParam = z.infer<typeof customerBankAccountsParamSchema>;
export type CustomerBankAccountParam = z.infer<typeof customerBankAccountParamSchema>;
export type SupplierBankAccountsParam = z.infer<typeof supplierBankAccountsParamSchema>;
export type SupplierBankAccountParam = z.infer<typeof supplierBankAccountParamSchema>;
export type NestedBankAccountsInput = z.infer<typeof nestedBankAccountsSchema>;
