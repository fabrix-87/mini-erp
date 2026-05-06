import { z } from "zod";
import {
  createDecimalSchemaRequired,
  createIdSchema,
  isoDateSchema,
} from "./primitives";
import { countryCodeBaseSchema } from "./base";
import { queryBooleanSchema, sortOrderSchema } from "./query";

// ============================================================================
// ENUMS
// ============================================================================

/**
 * VAT Nature Category enum
 */
export const vatNatureCategorySchema = z.enum([
  "EXCLUDED",
  "NOT_SUBJECT",
  "NOT_TAXABLE",
  "EXEMPT",
  "MARGIN",
  "REVERSE",
  "EU_VAT",
]);

/**
 * Tax Rule applicability enum
 */
export const taxRuleApplicabilitySchema = z.enum([
  "sales",
  "purchases",
  "both",
]);

// ============================================================================
// DECIMAL HELPERS
// ============================================================================

/**
 * Schema for Tax Rate (0-100 with 2 decimals)
 */
export const taxRateSchema = createDecimalSchemaRequired(2, {
  positiveOnly: true,
  min: 0,
  max: 100,
  messages: {
    min: "L'aliquota deve essere tra 0 e 100",
    max: "L'aliquota deve essere tra 0 e 100",
  },
});

/**
 * Schema for deductibility percentage (0-100 with 2 decimals)
 */
export const deductibilityPercentSchema = createDecimalSchemaRequired(2, {
  positiveOnly: true,
  min: 0,
  max: 100,
  defaultValue: "100",
});

// ============================================================================
// VAT NATURE SCHEMAS
// ============================================================================

/**
 * Schema for VAT Nature ID
 */
export const vatNatureIdSchema = createIdSchema("ID Natura IVA non valido");

/**
 * Schema for VAT Nature translation
 */
const vatNatureTranslationSchema = z
  .object({
    languageId: createIdSchema("ID lingua non valido"),
    description: z
      .string()
      .min(1, "Descrizione obbligatoria")
      .max(500, "Descrizione max 500 caratteri")
      .trim(),
    notes: z.string().max(5000).optional().nullable(),
  })
  .strict();

/**
 * Raw object shape for VatNature — no refinements, no strict.
 * Used as base for both create and update schemas.
 */
const vatNatureShape = z.object({
  code: z
    .string()
    .min(1, "Codice obbligatorio")
    .max(10, "Codice max 10 caratteri")
    .regex(/^N[0-9](\.[0-9]+)?$/, "Formato codice non valido (es: N1, N2.1)")
    .trim()
    .toUpperCase(),

  category: vatNatureCategorySchema,

  description: z
    .string()
    .min(1, "Descrizione obbligatoria")
    .max(500, "Descrizione max 500 caratteri")
    .trim(),

  extendedDescription: z.string().max(5000).optional().nullable(),
  legalReference: z.string().max(255).optional().nullable(),
  applicableToEntityTypes: z.string().max(10).optional().nullable(),
  validForSales: z.boolean().default(true),
  validForPurchases: z.boolean().default(false),
  vatReturnLine: z.string().max(10).optional().nullable(),
  requiresNormReference: z.boolean().default(false),
  usageExamples: z.string().max(5000).optional().nullable(),
  operationalNotes: z.string().max(5000).optional().nullable(),
  active: z.boolean().default(true),
  validFrom: isoDateSchema({ required: true }),
  validTo: isoDateSchema(),
  displayOrder: z.number().int().nonnegative().default(0),
  replacedByCode: z.string().max(10).optional().nullable(),
  translations: z.array(vatNatureTranslationSchema).optional().default([]),
});

/**
 * Schema for creating a VatNature — includes strict and code field.
 */
export const createVatNatureSchema = vatNatureShape.strict();

/**
 * Schema for updating a VatNature — partial of shape without `code`,
 * no refinements (partial updates may not include all fiscal fields).
 */
export const updateVatNatureSchema = vatNatureShape
  .omit({ code: true })
  .partial()
  .strict();

// ============================================================================
// TAX RULE SCHEMAS
// ============================================================================

/**
 * Schema for Tax Rule ID
 */
export const taxRuleIdSchema = createIdSchema("ID regola fiscale non valido");

/**
 * Schema for Tax Rule translation
 */
const taxRuleTranslationSchema = z
  .object({
    languageId: createIdSchema("ID lingua non valido"),
    name: z
      .string()
      .min(1, "Nome traduzione obbligatorio")
      .max(255, "Nome traduzione max 255 caratteri")
      .trim(),
    description: z.string().max(5000).optional().nullable(),
  })
  .strict();

/**
 * Raw object shape for TaxRule — no refinements, no strict.
 * Used as base for both create and update schemas.
 */
const taxRuleShape = z.object({
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

  description: z.string().max(5000).optional().nullable(),
  rate: taxRateSchema,
  vatNatureId: vatNatureIdSchema.optional().nullable(),
  normativeReference: z.string().max(255).optional().nullable(),
  countryCode: countryCodeBaseSchema.default("IT"),
  applicableFor: taxRuleApplicabilitySchema.default("both"),
  productCategory: z.string().max(50).optional().nullable(),
  customerType: z.string().max(20).optional().nullable(),
  isSplitPayment: z.boolean().default(false),
  deductibilityPercent: deductibilityPercentSchema,
  vatDeductible: z.boolean().default(true),
  validFrom: isoDateSchema({ required: true }),
  validTo: isoDateSchema(),
  active: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  displayOrder: z.number().int().nonnegative().default(0),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Formato colore non valido (es: #FF0000)")
    .optional()
    .nullable(),
  translations: z.array(taxRuleTranslationSchema).optional().default([]),
});

/**
 * Schema for creating a TaxRule — includes strict and cross-field refinements.
 * Cannot be used with .omit() or .partial() due to Zod v4 restrictions.
 */
export const createTaxRuleSchema = taxRuleShape
  .strict()
  .refine(
    (data) => {
      // vatNatureId required when rate is 0
      if (data.rate?.equals(0)) return !!data.vatNatureId;
      return true;
    },
    {
      message: "Natura IVA obbligatoria quando l'aliquota è 0",
      path: ["vatNatureId"],
    },
  )
  .refine(
    (data) => {
      // vatNatureId must NOT be set when rate > 0
      if (data.rate?.greaterThan(0) && data.vatNatureId) return false;
      return true;
    },
    {
      message: "Natura IVA non necessaria quando l'aliquota è maggiore di 0",
      path: ["vatNatureId"],
    },
  )
  .refine(
    (data) => {
      // validTo must be after validFrom
      if (data.validFrom && data.validTo) {
        return new Date(data.validTo) > new Date(data.validFrom);
      }
      return true;
    },
    {
      message:
        "La data di fine validità deve essere successiva alla data di inizio",
      path: ["validTo"],
    },
  );

/**
 * Schema for updating a TaxRule — partial of shape without `code`.
 * Cross-field refinements are intentionally omitted: partial updates may not
 * carry all fields needed to validate rate/vatNature consistency.
 * That validation is handled at the controller level when merging with DB data.
 */
export const updateTaxRuleSchema = taxRuleShape
  .omit({ code: true })
  .partial()
  .strict();

// ============================================================================
// VAT NATURE TRANSLATION SCHEMAS
// ============================================================================

/**
 * Schema for creating a VAT Nature translation
 */
export const createVatNatureTranslationSchema = z
  .object({
    vatNatureId: vatNatureIdSchema,
    languageId: createIdSchema("ID lingua non valido"),
    description: z
      .string()
      .min(1, "Descrizione obbligatoria")
      .max(500, "Descrizione max 500 caratteri")
      .trim(),
    notes: z.string().max(5000).optional().nullable(),
  })
  .strict();

/**
 * Schema for updating a VAT Nature translation
 */
export const updateVatNatureTranslationSchema = createVatNatureTranslationSchema
  .omit({ vatNatureId: true, languageId: true })
  .partial()
  .strict();

// ============================================================================
// TAX RULE TRANSLATION SCHEMAS
// ============================================================================

/**
 * Schema for creating a Tax Rule translation
 */
export const createTaxRuleTranslationSchema = z
  .object({
    taxRuleId: taxRuleIdSchema,
    languageId: createIdSchema("ID lingua non valido"),
    name: z
      .string()
      .min(1, "Nome traduzione obbligatorio")
      .max(255, "Nome traduzione max 255 caratteri")
      .trim(),
    description: z.string().max(5000).optional().nullable(),
  })
  .strict();

/**
 * Schema for updating a Tax Rule translation
 */
export const updateTaxRuleTranslationSchema = createTaxRuleTranslationSchema
  .omit({ taxRuleId: true, languageId: true })
  .partial()
  .strict();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Schema for VAT Nature queries
 */
export const vatNatureQuerySchema = z.object({
  active: queryBooleanSchema,
  category: vatNatureCategorySchema.optional(),
  validForSales: queryBooleanSchema,
  validForPurchases: queryBooleanSchema,
  search: z.string().optional(),
  sortBy: z
    .enum(["code", "description", "category", "displayOrder", "createdAt"])
    .default("displayOrder"),
  sortOrder: sortOrderSchema,
});

/**
 * Schema for Tax Rule queries
 */
export const taxRuleQuerySchema = z.object({
  active: queryBooleanSchema,
  isDefault: queryBooleanSchema,
  applicableFor: taxRuleApplicabilitySchema.optional(),
  countryCode: countryCodeBaseSchema.optional(),
  vatNatureId: vatNatureIdSchema.optional(),
  minRate: taxRateSchema.optional(),
  maxRate: taxRateSchema.optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["code", "name", "rate", "countryCode", "displayOrder", "createdAt"])
    .default("displayOrder"),
  sortOrder: sortOrderSchema,
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const vatNatureIdParamSchema = z.object({
  id: vatNatureIdSchema,
});

export const taxRuleIdParamSchema = z.object({
  id: taxRuleIdSchema,
});

export const vatNatureTranslationIdParamSchema = z.object({
  vatNatureId: vatNatureIdSchema,
  languageId: createIdSchema("ID lingua non valido"),
});

export const taxRuleTranslationIdParamSchema = z.object({
  taxRuleId: taxRuleIdSchema,
  languageId: createIdSchema("ID lingua non valido"),
});

/**
 * Schema for toggling active status
 */
export const toggleTaxStatusSchema = z
  .object({
    active: z.boolean({ message: "Campo active obbligatorio" }),
  })
  .strict();
