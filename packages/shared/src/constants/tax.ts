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

export const TAX_RULE_SOFT_FIELDS = {
  code: "code",
  name: "name",
  rate: "rate",
  countryCode: "countryCode",
  displayOrder: "displayOrder",
  createdAt: "createdAt",
} as const;

export const VAT_NATURE_CATEGORY = {
  EXCLUDED: "EXCLUDED",
  NOT_SUBJECT: "NOT_SUBJECT",
  NOT_TAXABLE: "NOT_TAXABLE",
  EXEMPT: "EXEMPT",
  MARGIN: "MARGIN",
  REVERSE: "REVERSE",
  EU_VAT: "EU_VAT",
} as const;

export const TAX_RULE_APPLICABILITY = {
  SALES: "SALES",
  PURCHASES: "PURCHASES",
  BOTH: "BOTH",
} as const;

export const TAX_RULE_CUSTOMER_TYPE = {
  B2B: "B2B",
  B2C: "B2C",
  PA: "PA",
  FOREIGN: "FOREIGN",
  ANY: "ANY",
} as const;
