// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import {
  createVatNatureSchema,
  updateVatNatureSchema,
  createVatNatureTranslationSchema,
  updateVatNatureTranslationSchema,
  createTaxRuleSchema,
  updateTaxRuleSchema,
  createTaxRuleTranslationSchema,
  updateTaxRuleTranslationSchema,
  vatNatureIdParamSchema,
  vatNatureQuerySchema,
  taxRuleIdParamSchema,
  taxRuleQuerySchema,
  vatNatureTranslationIdParamSchema,
  taxRuleTranslationIdParamSchema,
  toggleTaxStatusSchema,
} from "../validators/tax";
import type { Language } from "./language";
import type { Country } from "./country";
import Decimal from "decimal.js";
import { TaxRuleApplicability } from "../constants/tax";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * VAT Nature entity
 */
export type VatNature = Omit<CreateVatNatureInput, "translations"> & {
  id: number;
  replacedBy?: VatNature | null;
  replacements: VatNature[];
  translations: VatNatureTranslation[];
  taxRules: TaxRule[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * VAT Nature Translation entity
 */
export type VatNatureTranslation = {
  id: number;
  vatNatureId: number;
  vatNature: VatNature;
  languageId: number;
  language: Language;
  description: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Tax Rule entity
 */
export type TaxRule = Omit<CreateTaxRuleInput, "translations"> & {
  id: number;
  vatNature?: VatNature | null;
  country: Country;
  translations: TaxRuleTranslation[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Tax Rule Translation entity
 */
export type TaxRuleTranslation = {
  id: number;
  taxRuleId: number;
  taxRule: TaxRule;
  languageId: number;
  language: Language;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

// VAT Nature inputs
export type CreateVatNatureInput = z.infer<typeof createVatNatureSchema>;
export type UpdateVatNatureInput = z.infer<typeof updateVatNatureSchema>;
export type CreateVatNatureTranslationInput = z.infer<
  typeof createVatNatureTranslationSchema
>;
export type UpdateVatNatureTranslationInput = z.infer<
  typeof updateVatNatureTranslationSchema
>;

// Tax Rule inputs
export type CreateTaxRuleInput = z.infer<typeof createTaxRuleSchema>;
export type UpdateTaxRuleInput = z.infer<typeof updateTaxRuleSchema>;
export type CreateTaxRuleTranslationInput = z.infer<
  typeof createTaxRuleTranslationSchema
>;
export type UpdateTaxRuleTranslationInput = z.infer<
  typeof updateTaxRuleTranslationSchema
>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type VatNatureQueryInput = z.infer<typeof vatNatureQuerySchema>;
export type TaxRuleQueryInput = z.infer<typeof taxRuleQuerySchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type VatNatureIdParam = z.infer<typeof vatNatureIdParamSchema>;
export type TaxRuleIdParam = z.infer<typeof taxRuleIdParamSchema>;
export type VatNatureTranslationIdParam = z.infer<
  typeof vatNatureTranslationIdParamSchema
>;
export type TaxRuleTranslationIdParam = z.infer<
  typeof taxRuleTranslationIdParamSchema
>;

// ============================================================================
// ACTION TYPES (using z.infer)
// ============================================================================

export type ToggleTaxStatusInput = z.infer<typeof toggleTaxStatusSchema>;

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

/**
 * Input for tax calculation
 */
export interface TaxCalculationInput {
  netAmount: Decimal;
  taxRule: TaxRule;
  /** Optional quantity for unit price calculations */
  quantity?: Decimal;
}

/**
 * Result of tax calculation
 */
export interface TaxCalculationResult {
  /** Net amount (base imponibile) */
  netAmount: Decimal;
  /** Tax rate percentage (aliquota) */
  taxRate: Decimal;
  /** Calculated tax amount (importo IVA) */
  taxAmount: Decimal;
  /** Gross amount (totale lordo) */
  grossAmount: Decimal;
  /** VAT nature code if applicable */
  vatNatureCode: string | null;
  /** Normative reference if VAT exempt/excluded */
  normativeReference: string | null;
  /** Whether VAT is deductible */
  vatDeductible: boolean;
  /** Deductibility percentage */
  deductibilityPercent: Decimal;
  /** Whether split payment applies */
  isSplitPayment: boolean;
}

/**
 * Tax summary for documents
 */
export interface TaxSummary {
  /** Tax rule applied */
  taxRule: TaxRule;
  /** Total net amount for this tax rate */
  totalNetAmount: Decimal;
  /** Total tax amount */
  totalTaxAmount: Decimal;
  /** Total gross amount */
  totalGrossAmount: Decimal;
  /** Number of lines with this tax rule */
  linesCount: number;
}

/**
 * Complete document tax breakdown
 */
export interface DocumentTaxBreakdown {
  /** Tax summaries by tax rule */
  summaries: TaxSummary[];
  /** Total net amount of document */
  totalNetAmount: Decimal;
  /** Total tax amount of document */
  totalTaxAmount: Decimal;
  /** Total gross amount of document */
  totalGrossAmount: Decimal;
  /** Total deductible tax amount */
  totalDeductibleTax: Decimal;
  /** Total non-deductible tax amount */
  totalNonDeductibleTax: Decimal;
  /** Whether document has split payment */
  hasSplitPayment: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * VAT Nature with translations for specific language
 */
export type VatNatureWithTranslation = VatNature & {
  translatedDescription?: string;
  translatedNotes?: string;
};

/**
 * Tax Rule with translations for specific language
 */
export type TaxRuleWithTranslation = TaxRule & {
  translatedName?: string;
  translatedDescription?: string;
};

/**
 * Tax rule selection criteria
 */
export interface TaxRuleSelectionCriteria {
  countryCode: string;
  applicableFor: TaxRuleApplicability;
  productCategory?: string;
  customerType?: string;
  date?: Date;
}

/**
 * VAT validation result
 */
export interface VatValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  taxRule?: TaxRule;
  vatNature?: VatNature;
}
