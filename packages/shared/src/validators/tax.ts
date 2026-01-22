import { z } from "zod";
import {
  createDecimalSchema,
  createIdSchema,
  QueryBooleanSchema,
  sortOrderSchema,
} from "../utils";

// ============================================================================
// DECIMAL HELPERS
// ============================================================================

/**
 * Schema per Decimal(5, 2) - Tax Rate
 */
export const TaxRateSchema = createDecimalSchema(2, {
  positiveOnly: true,
  min: 0,
  max: 100,
  error: "L'aliquota deve essere tra 0 e 100",
});

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
 * Schema per l'ld di una Tax Rule
 */
export const TaxRuleIdSchema = createIdSchema("Tax Rule  ID non valido");

/**
 * Schema per una singola traduzione
 */
const TaxRuleTranslationSchema = z
  .object({
    languageId: createIdSchema("ID lingua non valido"),
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
    taxRateId: createIdSchema("ID Tax Rate non valido"),
    active: z.boolean().default(true),
    translations: z.array(TaxRuleTranslationSchema).optional().default([]),
  })
  .strict();

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
    taxRuleId: createIdSchema("ID Tax Rule non valido"),
    languageId: createIdSchema("ID lingua non valido"),
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
export const UpdateTaxRuleTranslationSchema =
  CreateTaxRuleTranslationSchema.omit({ taxRuleId: true, languageId: true })
    .partial()
    .strict();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Schema per query Tax Rate
 */
export const TaxRateQuerySchema = z.object({
  active: QueryBooleanSchema,
  minRate: createDecimalSchema(2, {
    positiveOnly: true,
    min: 0,
    max: 100,
  }).optional(),
  maxRate: createDecimalSchema(2, {
    positiveOnly: true,
    min: 0,
    max: 100,
  }).optional(),
  sortBy: z.enum(["rate", "name", "createdAt"]).default("rate"),
  sortOrder: sortOrderSchema,
});

/**
 * Schema per query Tax Rule
 */
export const TaxRuleQuerySchema = z.object({
  active: QueryBooleanSchema,
  operationType: z.string().optional(),
  taxRateId: createIdSchema("ID Tax Rate non valido"),
  search: z.string().optional(),
  sortBy: z
    .enum(["code", "name", "operationType", "createdAt"])
    .default("code"),
  sortOrder: sortOrderSchema,
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const TaxRateIdParamSchema = z.object({
  id: createIdSchema("ID Tax Rate non valido"),
});

export const TaxRuleIdParamSchema = z.object({
  id: createIdSchema("ID Tax Rule non valido"),
});

export const TaxRuleTranslationIdParamSchema = z.object({
  taxRuleId: createIdSchema("ID Tax Rule non valido"),
  languageId: createIdSchema("ID lingua non valido"),
});

/**
 * Schema per toggle active status
 */
export const ToggleTaxStatusSchema = z
  .object({
    active: z.boolean({ error: "Campo active obbligatorio" }),
  })
  .strict();
