import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import {
  createTaxRuleSchema,
  createTaxRuleTranslationSchema,
  taxRuleIdParamSchema,
  taxRuleQuerySchema,
  taxRuleTranslationIdParamSchema,
  toggleTaxStatusSchema,
  updateTaxRuleSchema,
  updateTaxRuleTranslationSchema,
} from "@mini-erp/shared";

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

export const validateToggleTaxRateStatus = validateBody(
  toggleTaxStatusSchema,
  "Toggle Tax Rate status",
);

// Tax Rule Validators
export const validateCreateTaxRule = validateBody(
  createTaxRuleSchema,
  "Tax Rule creation",
);

export const validateUpdateTaxRule = validateBody(
  updateTaxRuleSchema,
  "Tax Rule update",
);

export const validateTaxRuleId = validateParams(
  taxRuleIdParamSchema,
  "Tax Rule ID",
);

export const validateTaxRuleQuery = validateQuery(
  taxRuleQuerySchema,
  "Tax Rule query",
);

export const validateToggleTaxRuleStatus = validateBody(
  toggleTaxStatusSchema,
  "Toggle Tax Rule status",
);

// Tax Rule Translation Validators
export const validateCreateTaxRuleTranslation = validateBody(
  createTaxRuleTranslationSchema,
  "Tax Rule Translation creation",
);

export const validateUpdateTaxRuleTranslation = validateBody(
  updateTaxRuleTranslationSchema,
  "Tax Rule Translation update",
);

export const validateTaxRuleTranslationId = validateParams(
  taxRuleTranslationIdParamSchema,
  "Tax Rule Translation ID",
);
