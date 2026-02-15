// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import {
  CreateTaxRateSchema,
  CreateTaxRuleSchema,
  CreateTaxRuleTranslationSchema,
  TaxRateIdParamSchema,
  TaxRateQuerySchema,
  TaxRuleIdParamSchema,
  TaxRuleQuerySchema,
  ToggleTaxStatusSchema,
  UpdateTaxRateSchema,
  UpdateTaxRuleSchema,
  UpdateTaxRuleTranslationSchema,
} from "../validators";
import { Language } from "./language";
import { Money } from "./currency";

// Entity Types
export type TaxRate = CreateTaxRateInput & {
    id: number;
    rules: TaxRule[];

    createdAt: Date;
    updatedAt: Date;
}

export type TaxRule = Omit<CreateTaxRuleInput, 'translations'> & {
    id: number;
    taxRate?: TaxRate;
    taxRuleTranslations: TaxRuleTranslation[];
    
    createdAt: Date;
    updatedAt: Date;
}

export type TaxRuleTranslation = {
    id: number;
    name: string;
    languageId: number;
    language: Language;

    createdAt: Date;
    updatedAt: Date;
}

// services interfaces
export interface TaxCalculationInput {
  netAmount: Money;
  taxRule: TaxRule;
}

export interface TaxCalculationResult {
  netAmount: Money;
  taxRate: Money;
  taxAmount: Money;
  grossAmount: Money;
  vatNatureCode: string | null;
}

// Input Types
export type CreateTaxRateInput = z.infer<typeof CreateTaxRateSchema>;
export type UpdateTaxRateInput = z.infer<typeof UpdateTaxRateSchema>;
export type CreateTaxRuleInput = z.infer<typeof CreateTaxRuleSchema>;
export type UpdateTaxRuleInput = z.infer<typeof UpdateTaxRuleSchema>;
export type CreateTaxRuleTranslationInput = z.infer<
  typeof CreateTaxRuleTranslationSchema
>;
export type UpdateTaxRuleTranslationInput = z.infer<
  typeof UpdateTaxRuleTranslationSchema
>;

// Query Types
export type TaxRateQueryInput = z.infer<typeof TaxRateQuerySchema>;
export type TaxRuleQueryInput = z.infer<typeof TaxRuleQuerySchema>;

// Param Types
export type TaxRateIdParam = z.infer<typeof TaxRateIdParamSchema>;
export type TaxRuleIdParam = z.infer<typeof TaxRuleIdParamSchema>;

// Action Types
export type ToggleTaxStatusInput = z.infer<typeof ToggleTaxStatusSchema>;
