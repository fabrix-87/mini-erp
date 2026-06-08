import { z } from "zod";
import { createIdSchema } from "./primitives/id";
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
} from "../constants/attribute";
import { urlSchema } from "./primitives";

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

export const attributeGroupIdSchema = createIdSchema("ID Attribute Group non valido");

export const createAttributeGroupSchema = z
  .object({
    code: attributeGroupCodeSchema,

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
    attributeGroupId: attributeGroupIdSchema,

    languageId: createIdSchema("Language ID non valido"),

    name: z
      .string()
      .min(1, "Nome obbligatorio")
      .max(MAX_ATTRIBUTE_NAME_LENGTH, `Nome max ${MAX_ATTRIBUTE_NAME_LENGTH} caratteri`)
      .trim(),

    publicName: z
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

export const attributeIdSchema = createIdSchema("ID Attribute non valido");

export const createAttributeSchema = z
  .object({
    attributeGroupId: attributeGroupIdSchema,

    code: attributeCodeSchema,

    metadata: attributeMetadataSchema,

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
    attributeId: attributeIdSchema,

    languageId: createIdSchema("Language ID non valido"),

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
    productVariantId: createIdSchema("Product Variant ID non valido"),

    attributeId: attributeIdSchema,
  })
  .strict();

export const bulkAssignAttributesSchema = z
  .object({
    productVariantId: createIdSchema("Product Variant ID non valido"),

    attributeIds: z.array(attributeIdSchema).min(1, "Seleziona almeno un attributo"),
  })
  .strict();

export const bulkRemoveAttributesSchema = z
  .object({
    productVariantId: createIdSchema("Product Variant ID non valido"),

    attributeIds: z.array(attributeIdSchema).min(1, "Seleziona almeno un attributo"),
  })
  .strict();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const attributeGroupQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  displayType: attributeDisplayTypeSchema.optional(),
  isPublic: queryBooleanSchema,
  sortBy: z.enum(["code", "position", "createdAt"]).default("position"),
  sortOrder: sortOrderSchema,
});

export const attributeQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  attributeGroupId: attributeGroupIdSchema.optional(),
  hasColor: queryBooleanSchema,
  hasImage: queryBooleanSchema,
  sortBy: z.enum(["code", "position", "createdAt"]).default("position"),
  sortOrder: sortOrderSchema,
});

export const productVariantAttributeQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  productVariantId: createIdSchema("Product Variant ID non valido").optional(),
  attributeGroupId: attributeGroupIdSchema.optional(),
  sortBy: z.enum(["position", "createdAt"]).default("position"),
  sortOrder: sortOrderSchema,
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const attributeGroupIdParamSchema = z.object({
  id: attributeGroupIdSchema,
});

export const attributeIdParamSchema = z.object({
  id: attributeIdSchema,
});

export const attributeGroupTranslationParamSchema = z.object({
  attributeGroupId: attributeGroupIdSchema,
  languageId: createIdSchema("Language ID non valido"),
});

export const attributeTranslationParamSchema = z.object({
  attributeId: attributeIdSchema,
  languageId: createIdSchema("Language ID non valido"),
});

export const productVariantAttributeParamSchema = z.object({
  productVariantId: createIdSchema("Product Variant ID non valido"),
  attributeId: attributeIdSchema,
});

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export const batchCreateAttributesSchema = z
  .object({
    attributeGroupId: attributeGroupIdSchema,

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
          id: attributeIdSchema,
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
      .array(attributeIdSchema)
      .min(1, "Seleziona almeno un attributo")
      .max(100, "Massimo 100 attributi per richiesta"),
  })
  .strict();
