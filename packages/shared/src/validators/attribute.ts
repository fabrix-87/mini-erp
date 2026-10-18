import { z } from "zod";
import { sortOrderSchema, pageSchema, limitSchema } from "./query/pagination";
import { queryBooleanSchema } from "./query/params";
import {
  ATTRIBUTE_DISPLAY_TYPES,
  MAX_ATTRIBUTE_GROUP_CODE_LENGTH,
  MAX_ATTRIBUTE_CODE_LENGTH,
  MAX_ATTRIBUTE_NAME_LENGTH,
  COLOR_HEX_PATTERN,
  PMS_COLOR_PATTERN,
  MAX_IMAGE_URL_LENGTH,
  ATTRIBUTE_GROUP_SORT_OPTIONS,
  ATTRIBUTE_SORT_OPTIONS,
} from "../constants";
import { urlSchema } from "./primitives";
import {
  attributeGroupIdBaseSchema,
  attributeIdBaseSchema,
  languageIdBaseSchema,
  productVariantIdBaseSchema,
} from "./base";
import { MAX_PRODUCT_VARIANT_AXES } from "../constants";

// ============================================================================
// ENUMS
// ============================================================================

export const attributeDisplayTypeSchema = z.enum([
  ATTRIBUTE_DISPLAY_TYPES.SELECT,
  ATTRIBUTE_DISPLAY_TYPES.RADIO,
  ATTRIBUTE_DISPLAY_TYPES.COLOR,
  ATTRIBUTE_DISPLAY_TYPES.IMAGE,
]);

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate color hex code
 */
const colorHexSchema = z
  .string()
  .regex(COLOR_HEX_PATTERN, "Codice colore hex non valido")
  .transform((val) => {
    // Ensure it starts with #
    return val.startsWith("#") ? val : `#${val}`;
  })
  .refine((val) => val.length === 7 || val.length === 4, {
    message: "Codice colore deve essere 3 o 6 caratteri (escluso #)",
  });

/**
 * Validate PMS color code
 */
const pmsColorSchema = z
  .string()
  .max(20, "Codice PMS max 20 caratteri")
  .regex(PMS_COLOR_PATTERN, "Codice PMS non valido (es: PMS 485C)");

/**
 * Validate attribute metadata
 */
const attributeMetadataSchema = z.object({
  colorHex: colorHexSchema.optional().nullable(),
  colorHex2: colorHexSchema.optional().nullable(),
  colorPms: pmsColorSchema.optional().nullable(),
  colorPms2: pmsColorSchema.optional().nullable(),
  imageUrl: urlSchema(false, MAX_IMAGE_URL_LENGTH),
});

/**
 * Validate attribute group code (slug)
 */
const attributeGroupCodeSchema = z
  .string()
  .min(1, "Codice gruppo attributo obbligatorio")
  .max(MAX_ATTRIBUTE_GROUP_CODE_LENGTH, `Codice max ${MAX_ATTRIBUTE_GROUP_CODE_LENGTH} caratteri`)
  .regex(
    /^[a-z0-9_-]+$/,
    "Codice può contenere solo lettere minuscole, numeri, underscore e trattini",
  )
  .trim();

/**
 * Validate attribute code (slug)
 */
const attributeCodeSchema = z
  .string()
  .min(1, "Codice attributo obbligatorio")
  .max(MAX_ATTRIBUTE_CODE_LENGTH, `Codice max ${MAX_ATTRIBUTE_CODE_LENGTH} caratteri`)
  .regex(
    /^[a-z0-9_-]+$/,
    "Codice può contenere solo lettere minuscole, numeri, underscore e trattini",
  )
  .trim();

// ============================================================================
// ATTRIBUTE GROUP SCHEMAS
// ============================================================================

export const createAttributeGroupSchema = z
  .object({
    code: attributeGroupCodeSchema,
    externalCode: z.string().max(100).nullish(),
    displayType: attributeDisplayTypeSchema.default(ATTRIBUTE_DISPLAY_TYPES.SELECT),
    position: z.number().int().nonnegative("Position non può essere negativa").default(0),
    isPublic: z.boolean().default(true),
  })
  .strict();

export const updateAttributeGroupSchema = createAttributeGroupSchema.partial().strict();

// ============================================================================
// ATTRIBUTE GROUP TRANSLATION SCHEMAS
// ============================================================================

export const createAttributeGroupTranslationSchema = z
  .object({
    attributeGroupId: attributeGroupIdBaseSchema,
    languageId: languageIdBaseSchema,
    name: z
      .string()
      .min(1, "Nome obbligatorio")
      .max(MAX_ATTRIBUTE_NAME_LENGTH, `Nome max ${MAX_ATTRIBUTE_NAME_LENGTH} caratteri`)
      .trim(),
    displayName: z
      .string()
      .max(MAX_ATTRIBUTE_NAME_LENGTH, `Nome pubblico max ${MAX_ATTRIBUTE_NAME_LENGTH} caratteri`)
      .optional()
      .nullable(),
  })
  .strict();

export const updateAttributeGroupTranslationSchema = createAttributeGroupTranslationSchema
  .omit({ attributeGroupId: true, languageId: true })
  .partial()
  .strict();

// ============================================================================
// ATTRIBUTE SCHEMAS
// ============================================================================

export const createAttributeSchema = z
  .object({
    attributeGroupId: attributeGroupIdBaseSchema,
    code: attributeCodeSchema,
    metadata: attributeMetadataSchema.nullish(),
    position: z.number().int().nonnegative("Position non può essere negativa").default(0),
  })
  .strict();

export const updateAttributeSchema = createAttributeSchema
  .omit({ attributeGroupId: true })
  .partial()
  .strict();

// ============================================================================
// ATTRIBUTE TRANSLATION SCHEMAS
// ============================================================================

export const createAttributeTranslationSchema = z
  .object({
    attributeId: attributeIdBaseSchema,
    languageId: languageIdBaseSchema,
    name: z
      .string()
      .min(1, "Nome obbligatorio")
      .max(MAX_ATTRIBUTE_NAME_LENGTH, `Nome max ${MAX_ATTRIBUTE_NAME_LENGTH} caratteri`)
      .trim(),
  })
  .strict();

export const updateAttributeTranslationSchema = createAttributeTranslationSchema
  .omit({ attributeId: true, languageId: true })
  .partial()
  .strict();

// ============================================================================
// PRODUCT VARIANT ATTRIBUTE SCHEMAS
// ============================================================================

export const createProductVariantAttributeSchema = z
  .object({
    productVariantId: productVariantIdBaseSchema,
    attributeId: attributeIdBaseSchema,
  })
  .strict();

export const bulkAssignAttributesSchema = z
  .object({
    productVariantId: productVariantIdBaseSchema,
    attributeIds: z.array(attributeIdBaseSchema).min(1, "Seleziona almeno un attributo"),
  })
  .strict();

export const bulkRemoveAttributesSchema = z
  .object({
    productVariantId: productVariantIdBaseSchema,
    attributeIds: z.array(attributeIdBaseSchema).min(1, "Seleziona almeno un attributo"),
  })
  .strict();

// packages/shared/src/validators/attribute.ts
/** Replaces all attribute values of a variant (PUT /variants/:id/attributes). One value per product axis. */
export const setProductVariantAttributesSchema = z
  .object({
    attributeIds: z
      .array(attributeIdBaseSchema)
      .max(MAX_PRODUCT_VARIANT_AXES)
      .refine((ids) => new Set(ids).size === ids.length, "Attributi duplicati"),
  })
  .strict();

export const productVariantAttributeParamSchema = z.object({
  productVariantId: productVariantIdBaseSchema,
  attributeId: attributeIdBaseSchema,
});

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const attributeGroupQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  displayType: attributeDisplayTypeSchema.optional(),
  isPublic: queryBooleanSchema,
  sortBy: z.enum(ATTRIBUTE_GROUP_SORT_OPTIONS).default("position"),
  sortOrder: sortOrderSchema,
});

export const attributeQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  attributeGroupId: attributeGroupIdBaseSchema.optional(),
  hasColor: queryBooleanSchema,
  hasImage: queryBooleanSchema,
  sortBy: z.enum(ATTRIBUTE_SORT_OPTIONS).default("position"),
  sortOrder: sortOrderSchema,
});

export const productVariantAttributeQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  productVariantId: productVariantIdBaseSchema.optional(),
  attributeGroupId: attributeGroupIdBaseSchema.optional(),
  sortBy: z.enum(["position", "createdAt"]).default("position"),
  sortOrder: sortOrderSchema,
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const attributeGroupIdParamSchema = z.object({
  id: attributeGroupIdBaseSchema,
});

export const attributeIdParamSchema = z.object({
  id: attributeIdBaseSchema,
});

export const attributeGroupTranslationParamSchema = z.object({
  attributeGroupId: attributeGroupIdBaseSchema,
  languageId: languageIdBaseSchema,
});

export const attributeTranslationParamSchema = z.object({
  attributeId: attributeIdBaseSchema,
  languageId: languageIdBaseSchema,
});

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export const batchCreateAttributesSchema = z
  .object({
    attributeGroupId: attributeGroupIdBaseSchema,

    attributes: z
      .array(
        createAttributeSchema.omit({ attributeGroupId: true }).extend({
          translations: z.array(createAttributeTranslationSchema.omit({ attributeId: true })),
        }),
      )
      .min(1, "Almeno un attributo richiesto")
      .max(100, "Massimo 100 attributi per richiesta"),
  })
  .strict();

export const batchUpdateAttributesSchema = z
  .object({
    updates: z
      .array(
        z.object({
          id: attributeIdBaseSchema,
          data: updateAttributeSchema,
        }),
      )
      .min(1, "Almeno un aggiornamento richiesto")
      .max(100, "Massimo 100 aggiornamenti per richiesta"),
  })
  .strict();

export const batchDeleteAttributesSchema = z
  .object({
    attributeIds: z
      .array(attributeIdBaseSchema)
      .min(1, "Seleziona almeno un attributo")
      .max(100, "Massimo 100 attributi per richiesta"),
  })
  .strict();
