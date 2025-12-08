import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/client";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";

// ============================================================================
// DECIMAL HELPERS
// ============================================================================

/**
 * Schema per Decimal(5, 2) - Tax Rate
 */
const TaxRateSchema = z
  .union([
    z.string().regex(/^\d+(\.\d{1,2})?$/, "Formato aliquota non valido (max 2 decimali)"),
    z.number(),
  ])
  .transform((val) => new Decimal(val))
  .refine(
    (val) => val.greaterThanOrEqualTo(0) && val.lessThanOrEqualTo(100),
    {
      message: "L'aliquota deve essere tra 0 e 100",
    }
  );

// ============================================================================
// TAX RATE SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di una Tax Rate
 */
export const CreateTaxRateSchema = z
  .object({
    rate: TaxRateSchema,
    name: z
      .string()
      .min(1, "Nome obbligatorio")
      .max(50, "Nome max 50 caratteri")
      .trim(),
    active: z.boolean().default(true),
  })
  .strict();

/**
 * Schema per l'aggiornamento di una Tax Rate
 */
export const UpdateTaxRateSchema = CreateTaxRateSchema.partial().strict();

// ============================================================================
// TAX RULE SCHEMAS
// ============================================================================

/**
 * Schema per una singola traduzione
 */
const TaxRuleTranslationSchema = z
  .object({
    languageId: z.number().int().positive("ID lingua non valido"),
    name: z
      .string()
      .min(1, "Nome traduzione obbligatorio")
      .max(255, "Nome traduzione max 255 caratteri")
      .trim(),
  })
  .strict();

/**
 * Schema per la creazione di una Tax Rule
 */
export const CreateTaxRuleSchema = z
  .object({
    code: z
      .string()
      .min(1, "Codice obbligatorio")
      .max(20, "Codice max 20 caratteri")
      .trim()
      .toUpperCase(),
    name: z
      .string()
      .min(1, "Nome obbligatorio")
      .max(255, "Nome max 255 caratteri")
      .trim(),
    description: z.string().max(1000).optional().nullable(),
    operationType: z
      .string()
      .min(1, "Tipo operazione obbligatorio")
      .max(50, "Tipo operazione max 50 caratteri")
      .trim(),
    taxRateId: z.number().int().positive("ID Tax Rate non valido"),
    active: z.boolean().default(true),
    translations: z
      .array(TaxRuleTranslationSchema)
      .optional()
      .default([]),
  })
  .strict()
  .refine(
    (data) => {
      // Se ci sono traduzioni, verifica che non ci siano languageId duplicati
      if (data.translations && data.translations.length > 0) {
        const languageIds = data.translations.map(t => t.languageId);
        const uniqueIds = new Set(languageIds);
        return uniqueIds.size === languageIds.length;
      }
      return true;
    },
    {
      message: "Non puoi avere traduzioni duplicate per la stessa lingua",
      path: ["translations"],
    }
  );

/**
 * Schema per l'aggiornamento di una Tax Rule
 */
export const UpdateTaxRuleSchema = CreateTaxRuleSchema.partial().strict();

// ============================================================================
// TAX RULE TRANSLATION SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di una singola traduzione
 */
export const CreateTaxRuleTranslationSchema = z
  .object({
    taxRuleId: z.number().int().positive("ID Tax Rule non valido"),
    languageId: z.number().int().positive("ID lingua non valido"),
    name: z
      .string()
      .min(1, "Nome traduzione obbligatorio")
      .max(255, "Nome traduzione max 255 caratteri")
      .trim(),
  })
  .strict();

/**
 * Schema per l'aggiornamento di una traduzione
 */
export const UpdateTaxRuleTranslationSchema = CreateTaxRuleTranslationSchema
  .omit({ taxRuleId: true, languageId: true })
  .partial()
  .strict();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Schema per query Tax Rate
 */
export const TaxRateQuerySchema = z.object({
  active: z.enum(["true", "false"]).optional()
    .transform(val => val === "true"),
  minRate: z.string().regex(/^\d+(\.\d{1,2})?$/).optional()
    .transform(val => val ? new Decimal(val) : undefined),
  maxRate: z.string().regex(/^\d+(\.\d{1,2})?$/).optional()
    .transform(val => val ? new Decimal(val) : undefined),
  sortBy: z.enum(["rate", "name", "createdAt"]).default("rate"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * Schema per query Tax Rule
 */
export const TaxRuleQuerySchema = z.object({
  active: z.enum(["true", "false"]).optional()
    .transform(val => val === "true"),
  operationType: z.string().optional(),
  taxRateId: z.string().optional()
    .transform(val => val ? parseInt(val, 10) : undefined),
  search: z.string().optional(),
  sortBy: z.enum(["code", "name", "operationType", "createdAt"]).default("code"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const TaxRateIdParamSchema = z.object({
  id: z.string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().positive("ID Tax Rate non valido")),
});

export const TaxRuleIdParamSchema = z.object({
  id: z.string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().positive("ID Tax Rule non valido")),
});

export const TaxRuleTranslationIdParamSchema = z.object({
  taxRuleId: z.string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().positive("ID Tax Rule non valido")),
  languageId: z.string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().positive("ID lingua non valido")),
});

/**
 * Schema per toggle active status
 */
export const ToggleTaxStatusSchema = z
  .object({
    active: z.boolean({ error: "Campo active obbligatorio" }),
  })
  .strict();

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

// Tax Rate Validators
export const validateCreateTaxRate = validateBody(
  CreateTaxRateSchema,
  "Tax Rate creation"
);

export const validateUpdateTaxRate = validateBody(
  UpdateTaxRateSchema,
  "Tax Rate update"
);

export const validateTaxRateId = validateParams(
  TaxRateIdParamSchema,
  "Tax Rate ID"
);

export const validateTaxRateQuery = validateQuery(
  TaxRateQuerySchema,
  "Tax Rate query"
);

export const validateToggleTaxRateStatus = validateBody(
  ToggleTaxStatusSchema,
  "Toggle Tax Rate status"
);

// Tax Rule Validators
export const validateCreateTaxRule = validateBody(
  CreateTaxRuleSchema,
  "Tax Rule creation"
);

export const validateUpdateTaxRule = validateBody(
  UpdateTaxRuleSchema,
  "Tax Rule update"
);

export const validateTaxRuleId = validateParams(
  TaxRuleIdParamSchema,
  "Tax Rule ID"
);

export const validateTaxRuleQuery = validateQuery(
  TaxRuleQuerySchema,
  "Tax Rule query"
);

export const validateToggleTaxRuleStatus = validateBody(
  ToggleTaxStatusSchema,
  "Toggle Tax Rule status"
);

// Tax Rule Translation Validators
export const validateCreateTaxRuleTranslation = validateBody(
  CreateTaxRuleTranslationSchema,
  "Tax Rule Translation creation"
);

export const validateUpdateTaxRuleTranslation = validateBody(
  UpdateTaxRuleTranslationSchema,
  "Tax Rule Translation update"
);

export const validateTaxRuleTranslationId = validateParams(
  TaxRuleTranslationIdParamSchema,
  "Tax Rule Translation ID"
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateTaxRateInput = z.infer<typeof CreateTaxRateSchema>;
export type UpdateTaxRateInput = z.infer<typeof UpdateTaxRateSchema>;
export type CreateTaxRuleInput = z.infer<typeof CreateTaxRuleSchema>;
export type UpdateTaxRuleInput = z.infer<typeof UpdateTaxRuleSchema>;
export type CreateTaxRuleTranslationInput = z.infer<typeof CreateTaxRuleTranslationSchema>;
export type UpdateTaxRuleTranslationInput = z.infer<typeof UpdateTaxRuleTranslationSchema>;

export type TaxRateQueryInput = z.infer<typeof TaxRateQuerySchema>;
export type TaxRuleQueryInput = z.infer<typeof TaxRuleQuerySchema>;
export type ToggleTaxStatusInput = z.infer<typeof ToggleTaxStatusSchema>;