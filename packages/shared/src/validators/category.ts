import { z } from "zod";
import { createIdSchema } from "./primitives/id";
import { sortOrderSchema, pageSchema, limitSchema } from "./query/pagination";
import { queryBooleanSchema } from "./query/params";
import {
  MAX_CATEGORY_CODE_LENGTH,
  MAX_CATEGORY_NAME_LENGTH,
  MAX_CATEGORY_SLUG_LENGTH,
  MAX_CATEGORY_DESCRIPTION_LENGTH,
  MAX_META_TITLE_LENGTH,
  MAX_META_DESCRIPTION_LENGTH,
  SLUG_PATTERN,
  CATEGORY_CODE_PATTERN,
  RESERVED_CATEGORY_CODES,
  MAX_CATEGORY_DEPTH,
} from "../constants/category";
import { isoDateSchema } from "./primitives";

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate category code (alphanumeric, underscore, hyphen)
 */
const categoryCodeSchema = z
  .string()
  .min(1, "Codice categoria obbligatorio")
  .max(
    MAX_CATEGORY_CODE_LENGTH,
    `Codice max ${MAX_CATEGORY_CODE_LENGTH} caratteri`,
  )
  .regex(
    CATEGORY_CODE_PATTERN,
    "Codice può contenere solo lettere, numeri, underscore e trattini",
  )
  .refine(
    (code) => !RESERVED_CATEGORY_CODES.includes(code as any),
    {
      message: "Codice categoria è riservato",
    },
  )
  .trim();

/**
 * Validate slug (URL-friendly)
 */
const slugSchema = z
  .string()
  .max(MAX_CATEGORY_SLUG_LENGTH, `Slug max ${MAX_CATEGORY_SLUG_LENGTH} caratteri`)
  .regex(
    SLUG_PATTERN,
    "Slug può contenere solo lettere minuscole, numeri e trattini",
  )
  .optional()
  .nullable();

// ============================================================================
// CATEGORY SCHEMAS
// ============================================================================

export const categoryIdSchema = createIdSchema("ID Category non valido");

export const createCategorySchema = z
  .object({
    parentId: categoryIdSchema.optional().nullable(),

    code: categoryCodeSchema.optional().nullable(),

    active: z.boolean().default(true),

    position: z
      .number()
      .int()
      .nonnegative("Position non può essere negativa")
      .default(0),

    level: z
      .number()
      .int()
      .nonnegative("Level non può essere negativo")
      .max(MAX_CATEGORY_DEPTH, `Profondità massima ${MAX_CATEGORY_DEPTH}`)
      .default(0),
  })
  .strict();

export const updateCategorySchema = createCategorySchema
  .partial()
  .strict();

// ============================================================================
// CATEGORY TRANSLATION SCHEMAS
// ============================================================================

export const createCategoryTranslationSchema = z
  .object({
    categoryId: categoryIdSchema,

    languageId: createIdSchema("Language ID non valido"),

    name: z
      .string()
      .min(1, "Nome obbligatorio")
      .max(
        MAX_CATEGORY_NAME_LENGTH,
        `Nome max ${MAX_CATEGORY_NAME_LENGTH} caratteri`,
      )
      .trim(),

    slug: slugSchema,

    description: z
      .string()
      .max(
        MAX_CATEGORY_DESCRIPTION_LENGTH,
        `Descrizione max ${MAX_CATEGORY_DESCRIPTION_LENGTH} caratteri`,
      )
      .optional()
      .nullable(),

    linkRewrite: z
      .string()
      .max(MAX_CATEGORY_SLUG_LENGTH, `Link max ${MAX_CATEGORY_SLUG_LENGTH} caratteri`)
      .optional()
      .nullable(),

    metaTitle: z
      .string()
      .max(MAX_META_TITLE_LENGTH, `Meta title max ${MAX_META_TITLE_LENGTH} caratteri`)
      .optional()
      .nullable(),

    metaDescription: z
      .string()
      .max(
        MAX_META_DESCRIPTION_LENGTH,
        `Meta description max ${MAX_META_DESCRIPTION_LENGTH} caratteri`,
      )
      .optional()
      .nullable(),
  })
  .strict();

export const updateCategoryTranslationSchema = createCategoryTranslationSchema
  .omit({ categoryId: true, languageId: true })
  .partial()
  .strict();

// ============================================================================
// CATEGORY OPERATIONS
// ============================================================================

export const moveCategorySchema = z
  .object({
    categoryId: categoryIdSchema,

    newParentId: categoryIdSchema.optional().nullable(),

    newPosition: z
      .number()
      .int()
      .nonnegative("Position non può essere negativa")
      .optional(),
  })
  .strict()
  .refine(
    (data) => {
      // Cannot move category to itself
      return data.categoryId !== data.newParentId;
    },
    {
      message: "Una categoria non può essere spostata dentro se stessa",
      path: ["newParentId"],
    },
  );

export const reorderCategoriesSchema = z
  .object({
    parentId: categoryIdSchema.optional().nullable(),

    categoryOrders: z
      .array(
        z.object({
          categoryId: categoryIdSchema,
          position: z.number().int().nonnegative(),
        }),
      )
      .min(1, "Almeno una categoria richiesta"),
  })
  .strict();

export const duplicateCategorySchema = z
  .object({
    categoryId: categoryIdSchema,

    includeChildren: z.boolean().default(false),

    includeProducts: z.boolean().default(false),

    newParentId: categoryIdSchema.optional().nullable(),
  })
  .strict();

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export const bulkUpdateCategoriesSchema = z
  .object({
    categoryIds: z
      .array(categoryIdSchema)
      .min(1, "Seleziona almeno una categoria")
      .max(100, "Massimo 100 categorie per richiesta"),

    updates: updateCategorySchema,
  })
  .strict();

export const bulkDeleteCategoriesSchema = z
  .object({
    categoryIds: z
      .array(categoryIdSchema)
      .min(1, "Seleziona almeno una categoria")
      .max(100, "Massimo 100 categorie per richiesta"),

    deleteChildren: z.boolean().default(false),

    moveProductsToParent: z.boolean().default(true),
  })
  .strict();

export const bulkMoveCategoriesSchema = z
  .object({
    categoryIds: z
      .array(categoryIdSchema)
      .min(1, "Seleziona almeno una categoria")
      .max(100, "Massimo 100 categorie per richiesta"),

    newParentId: categoryIdSchema.optional().nullable(),
  })
  .strict();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const categoryQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  parentId: categoryIdSchema.optional(),
  level: z
    .string()
    .regex(/^\d+$/)
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  active: queryBooleanSchema,
  hasProducts: queryBooleanSchema,
  hasChildren: queryBooleanSchema,
  sortBy: z
    .enum(["name", "code", "position", "level", "createdAt", "updatedAt"])
    .default("position"),
  sortOrder: sortOrderSchema,
});

export const categoryTreeQuerySchema = z.object({
  rootId: categoryIdSchema.optional(),
  maxDepth: z
    .number()
    .int()
    .positive()
    .max(MAX_CATEGORY_DEPTH)
    .default(MAX_CATEGORY_DEPTH),
  activeOnly: z.boolean().default(false),
  includeProductCount: z.boolean().default(false),
  languageId: createIdSchema("Language ID non valido").optional(),
});

export const categoryPathQuerySchema = z.object({
  categoryId: categoryIdSchema,
  languageId: createIdSchema("Language ID non valido").optional(),
});

export const categorySiblingsQuerySchema = z.object({
  categoryId: categoryIdSchema,
  includeInactive: z.boolean().default(false),
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const categoryIdParamSchema = z.object({
  id: categoryIdSchema,
});

export const categoryTranslationParamSchema = z.object({
  categoryId: categoryIdSchema,
  languageId: createIdSchema("Language ID non valido"),
});

// ============================================================================
// STATISTICS SCHEMAS
// ============================================================================

export const categoryStatsSchema = z.object({
  categoryId: categoryIdSchema.optional(),
  includeChildren: z.boolean().default(true),
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
});
