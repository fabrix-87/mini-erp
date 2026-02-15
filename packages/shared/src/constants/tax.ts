import { z } from "zod";
import {
  taxRuleApplicabilitySchema,
  vatNatureCategorySchema,
} from "../validators";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type VatNatureCategory = z.infer<typeof vatNatureCategorySchema>;
export type TaxRuleApplicability = z.infer<typeof taxRuleApplicabilitySchema>;
