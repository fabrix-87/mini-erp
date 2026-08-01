import { z } from "zod";
import {
  taxRuleApplicabilitySchema,
  taxRuleCustomerTypeSchema,
  taxRuleSortFieldsSchema,
  vatNatureCategorySchema,
} from "../validators";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type VatNatureCategory = z.infer<typeof vatNatureCategorySchema>;
export type TaxRuleApplicability = z.infer<typeof taxRuleApplicabilitySchema>;
export type TaxRuleCustomerType = z.infer<typeof taxRuleCustomerTypeSchema>;
export type TaxRuleSortFields = z.infer<typeof taxRuleSortFieldsSchema>;
export const TaxRuleSortFields = taxRuleSortFieldsSchema.options