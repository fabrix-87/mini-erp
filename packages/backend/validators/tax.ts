import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import { CreateTaxRateSchema, CreateTaxRuleSchema, CreateTaxRuleTranslationSchema, TaxRateIdParamSchema, TaxRateQuerySchema, TaxRuleIdParamSchema, TaxRuleQuerySchema, TaxRuleTranslationIdParamSchema, ToggleTaxStatusSchema, UpdateTaxRateSchema, UpdateTaxRuleSchema, UpdateTaxRuleTranslationSchema } from "@mini-erp/shared";


// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

// Tax Rate Validators
export const validateCreateTaxRate = validateBody(
  CreateTaxRateSchema,
  "Tax Rate creation",
);

export const validateUpdateTaxRate = validateBody(
  UpdateTaxRateSchema,
  "Tax Rate update",
);

export const validateTaxRateId = validateParams(
  TaxRateIdParamSchema,
  "Tax Rate ID",
);

export const validateTaxRateQuery = validateQuery(
  TaxRateQuerySchema,
  "Tax Rate query",
);

export const validateToggleTaxRateStatus = validateBody(
  ToggleTaxStatusSchema,
  "Toggle Tax Rate status",
);

// Tax Rule Validators
export const validateCreateTaxRule = validateBody(
  CreateTaxRuleSchema,
  "Tax Rule creation",
);

export const validateUpdateTaxRule = validateBody(
  UpdateTaxRuleSchema,
  "Tax Rule update",
);

export const validateTaxRuleId = validateParams(
  TaxRuleIdParamSchema,
  "Tax Rule ID",
);

export const validateTaxRuleQuery = validateQuery(
  TaxRuleQuerySchema,
  "Tax Rule query",
);

export const validateToggleTaxRuleStatus = validateBody(
  ToggleTaxStatusSchema,
  "Toggle Tax Rule status",
);

// Tax Rule Translation Validators
export const validateCreateTaxRuleTranslation = validateBody(
  CreateTaxRuleTranslationSchema,
  "Tax Rule Translation creation",
);

export const validateUpdateTaxRuleTranslation = validateBody(
  UpdateTaxRuleTranslationSchema,
  "Tax Rule Translation update",
);

export const validateTaxRuleTranslationId = validateParams(
  TaxRuleTranslationIdParamSchema,
  "Tax Rule Translation ID",
);
