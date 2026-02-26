import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import {
  // Tax Rule
  createTaxRuleSchema,
  updateTaxRuleSchema,
  taxRuleIdParamSchema,
  taxRuleQuerySchema,
  toggleTaxStatusSchema,
  // Tax Rule Translation
  createTaxRuleTranslationSchema,
  updateTaxRuleTranslationSchema,
  taxRuleTranslationIdParamSchema,
  // VatNature
  createVatNatureSchema,
  updateVatNatureSchema,
  vatNatureIdParamSchema,
  vatNatureQuerySchema,
  vatNatureTranslationIdParamSchema,
  // VatNature Translation
  createVatNatureTranslationSchema,
  updateVatNatureTranslationSchema,
} from "@mini-erp/shared";

// ============================================================================
// TAX RULE VALIDATORS
// ============================================================================

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

export const validateToggleTaxStatus = validateBody(
  toggleTaxStatusSchema,
  "Toggle Tax status",
);

// ============================================================================
// TAX RULE TRANSLATION VALIDATORS
// ============================================================================

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

// ============================================================================
// VAT NATURE VALIDATORS
// ============================================================================

export const validateCreateVatNature = validateBody(
  createVatNatureSchema,
  "VAT Nature creation",
);

export const validateUpdateVatNature = validateBody(
  updateVatNatureSchema,
  "VAT Nature update",
);

export const validateVatNatureId = validateParams(
  vatNatureIdParamSchema,
  "VAT Nature ID",
);

export const validateVatNatureQuery = validateQuery(
  vatNatureQuerySchema,
  "VAT Nature query",
);

// ============================================================================
// VAT NATURE TRANSLATION VALIDATORS
// ============================================================================

export const validateCreateVatNatureTranslation = validateBody(
  createVatNatureTranslationSchema,
  "VAT Nature Translation creation",
);

export const validateUpdateVatNatureTranslation = validateBody(
  updateVatNatureTranslationSchema,
  "VAT Nature Translation update",
);

export const validateVatNatureTranslationId = validateParams(
  vatNatureTranslationIdParamSchema,
  "VAT Nature Translation ID",
);
