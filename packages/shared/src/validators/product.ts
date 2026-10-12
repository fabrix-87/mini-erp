import { z } from "zod";
import { createCuidSchema } from "./primitives/id";
import { isoDateSchema } from "./primitives/date";
import { priceSchema } from "./business/currency";
import {
  inputJsonValueSchema,
  languageIdBaseSchema,
  manufacturerIdBaseSchema,
  productCategoryIdBaseSchema,
  productIdBaseSchema,
  productImageIdBaseSchema,
  productVariantIdBaseSchema,
  supplierIdBaseSchema,
  taxRuleIdBaseSchema,
} from "./base";
import { limitSchema, pageSchema, sortOrderSchema } from "./query/pagination";
import { queryBooleanOrAllSchema, queryBooleanSchema } from "./query/params";
import {
  PRODUCT_CONDITION,
  PRODUCT_OUT_OF_STOCK_TYPE,
  PRODUCT_PACK_STOCK_TYPE,
  PRODUCT_REDIRECT_TYPE,
  PRODUCT_STATUS,
  PRODUCT_TYPE,
  PRODUCT_VISIBILITY,
} from "../constants";

// ============================================================================
// ENUMS
// ============================================================================

export const productTypeSchema = z.enum(PRODUCT_TYPE);
export const productConditionSchema = z.enum(PRODUCT_CONDITION);
export const productStatusSchema = z.enum(PRODUCT_STATUS);
export const productPackStockTypeSchema = z.enum(PRODUCT_PACK_STOCK_TYPE);
export const productOutOfStockTypeSchema = z.enum(PRODUCT_OUT_OF_STOCK_TYPE);
export const productVisibilitySchema = z.enum(PRODUCT_VISIBILITY);
export const productRedirectTypeSchema = z.enum(PRODUCT_REDIRECT_TYPE);

// ============================================================================
// PRODUCT VARIANT SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di una ProductVariant
 */
export const createProductVariantSchema = z
  .object({
    productId: productIdBaseSchema,

    // Identificatori univoci
    variantCode: z
      .string()
      .min(1, "Il codice variante è obbligatorio")
      .max(64, "Il codice variante non può superare 64 caratteri")
      .trim(),
    sku: z
      .string()
      .min(1, "Lo SKU è obbligatorio")
      .max(64, "Lo SKU non può superare 64 caratteri")
      .trim(),

    // Codici a barre
    ean13: z.string().length(13, "L'EAN-13 deve essere di 13 caratteri").optional().nullable(),
    upc: z.string().length(12, "L'UPC deve essere di 12 caratteri").optional().nullable(),
    isbn: z.string().max(32).optional().nullable(),
    mpn: z.string().max(40).optional().nullable(),

    // Stock e magazzino
    minimalQuantity: z.number().int().positive().default(1),
    lowStockThreshold: z.number().int().nonnegative().default(0),
    lowStockAlertEnabled: z.boolean().default(false),
    location: z.string().max(50).optional().nullable(),

    packStockType: productPackStockTypeSchema.default("USE_PACK_STOCK_ONLY"),
    outOfStockType: productOutOfStockTypeSchema.default("DENY_ORDERS"),
    availableDate: isoDateSchema().optional().nullable(),

    // Prezzi specifici
    price: priceSchema({ precision: 6 }).optional().nullable(),
    wholesalePrice: priceSchema({ precision: 6 }).optional().nullable(),
    unitPriceRatio: priceSchema({ precision: 8 }).default("0"),

    // Dimensioni fisiche
    weight: z.number().nonnegative().default(0).optional().nullable(),
    width: z.number().nonnegative().default(0).optional().nullable(),
    height: z.number().nonnegative().default(0).optional().nullable(),
    depth: z.number().nonnegative().default(0).optional().nullable(),

    // Configurazione
    position: z.number().int().default(0),
    isDefault: z.boolean().default(false),
    active: z.boolean().default(true),
    availableForOrder: z.boolean().default(true),

    metadata: inputJsonValueSchema.optional().nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento di una ProductVariant
 */
export const updateProductVariantSchema = createProductVariantSchema
  .omit({
    productId: true,
  })
  .partial()
  .strict();

/**
 * Schema per la validazione dell'ID variante
 */
export const productVariantIdSchema = z.object({
  id: productVariantIdBaseSchema,
});

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un nuovo Product
 */
export const createProductSchema = z
  .object({
    type: productTypeSchema.default("STANDARD"),
    status: productStatusSchema.default("DRAFT"),
    reference: z
      .string()
      .min(1, "Il riferimento è obbligatorio")
      .max(64, "Il riferimento non può superare 64 caratteri")
      .trim(),

    // Stati
    active: z.boolean().default(true),
    availableForOrder: z.boolean().default(true),
    showPrice: z.boolean().default(true),
    onlineOnly: z.boolean().default(false),
    onSale: z.boolean().default(false),

    // Prezzi
    price: priceSchema({ defaultValue: 0 }),
    wholesalePrice: priceSchema({ defaultValue: 0 }),
    ecotax: priceSchema({ defaultValue: 0 }),

    // Tassazione
    defaultTaxRuleId: taxRuleIdBaseSchema.nullish(),

    // Visibilità
    visibility: productVisibilitySchema.default("BOTH"),
    condition: productConditionSchema.default("NEW"),
    showCondition: z.boolean().default(false),

    // Relazioni opzionali
    manufacturerId: manufacturerIdBaseSchema.optional().nullable(),
    supplierId: supplierIdBaseSchema.optional().nullable(),

    // Logistica
    additionalShippingCost: priceSchema({ defaultValue: 0 }),
    carrierReferenceIds: z.any().optional().nullable(),
    deliveryTimeNoteType: z.number().int().default(0),

    // Redirect e SEO
    redirectType: productRedirectTypeSchema.default("NOT_FOUND"),
    redirectTargetId: createCuidSchema("Redirect target ID non valido").optional().nullable(),

    // Media
    coverThumbnailUrl: z.string().max(500).optional().nullable(),

    // VARIANTI OBBLIGATORIE
    variants: z
      .array(createProductVariantSchema.omit({ productId: true }))
      .min(1, "Almeno una variante è obbligatoria")
      .refine((variants) => variants.some((v) => v.isDefault === true) || variants.length === 1, {
        message: "Almeno una variante deve essere impostata come default",
      }),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un Product
 */
export const updateProductSchema = createProductSchema.partial().strict();

/**
 * Schema per la validazione dell'ID prodotto
 */
export const productIdSchema = z.object({
  id: productIdBaseSchema,
});

/**
 * Schema per la validazione dell'ID prodotto come productId
 */
export const productIdAsProductIdSchema = z.object({
  productId: productIdBaseSchema,
});

// ============================================================================
// PRODUCT TRANSLATION SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di una ProductVariantTranslation
 */
export const createProductTranslationSchema = z
  .object({
    productId: productIdBaseSchema,
    languageId: languageIdBaseSchema,

    name: z
      .string()
      .min(1, "Il nome è obbligatorio")
      .max(255, "Il nome non può superare 255 caratteri")
      .trim(),
    description: z.string().optional().nullable(),
    shortDescription: z.string().max(500).optional().nullable(),
    tags: z.string().max(500).optional().nullable(),

    // SEO
    metaTitle: z.string().max(255).optional().nullable(),
    metaDescription: z.string().optional().nullable(),
    metaKeywords: z.string().max(500).optional().nullable(),
    slug: z
      .string()
      .max(255, "Lo slug non può superare 255 caratteri")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Lo slug può contenere solo lettere minuscole, numeri e trattini",
      )
      .optional()
      .nullable(),

    // Etichette disponibilità
    availableNowLabel: z.string().max(100).default("In stock"),
    availableLaterLabel: z.string().max(100).default("Available soon"),
    deliveryTimeInStockNote: z.string().max(255).optional().nullable(),
    deliveryTimeOutOfStockNote: z.string().max(255).optional().nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento di una ProductVariantTranslation
 */
export const updateProductTranslationSchema = createProductTranslationSchema
  .omit({ productId: true, languageId: true })
  .partial()
  .strict();

/**
 * Schema for product+language params
 */
export const productIdLanguageIdSchema = z.object({
  id: productIdBaseSchema,
  languageId: languageIdBaseSchema,
});

// ============================================================================
// PRODUCT IMAGE SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di una ProductImage
 */
export const createProductImageSchema = z
  .object({
    productId: productIdBaseSchema,
    variantId: productIdBaseSchema.optional().nullable(),

    imageUrl: z.url("URL non valido"),
    imageType: z.string().max(20).default("extra"),
    position: z.number().int().default(0),
    isCover: z.boolean().default(false),

    altText: inputJsonValueSchema.nullable().optional(),

    width: z.number().int().positive().optional().nullable(),
    height: z.number().int().positive().optional().nullable(),
    fileSize: z.number().int().positive().optional().nullable(),
    mimeType: z.string().max(50).optional().nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento di una ProductImage
 */
export const updateProductImageSchema = createProductImageSchema
  .omit({
    productId: true,
  })
  .partial()
  .strict();

/**
 * Schema per la validazione dell'ID immagine
 */
export const productImageIdSchema = z.object({
  id: productImageIdBaseSchema,
  productId: productIdBaseSchema,
});

// ============================================================================
// PRODUCT CATEGORY SCHEMAS
// ============================================================================

/**
 * Schema per l'associazione Product-Category
 */
export const createProductCategorySchema = z
  .object({
    productId: productIdBaseSchema,
    categoryId: productCategoryIdBaseSchema,
    position: z.number().int().default(0),
  })
  .strict();

/**
 * Schema per l'aggiornamento della posizione Product-Category
 */
export const updateProductCategorySchema = z
  .object({
    position: z.number().int(),
  })
  .strict();

/**
 * Schema per la validazione dell'ID categoria
 */
export const productCategoryIdSchema = z.object({
  categoryId: productCategoryIdBaseSchema,
  productId: productIdBaseSchema,
});

// ============================================================================
// MANUFACTURER SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un Manufacturer
 */
export const createManufacturerSchema = z
  .object({
    name: z.string().min(1, "Il nome è obbligatorio").trim(),
    active: z.boolean().default(true),
    customFields: z.any().optional().nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un Manufacturer
 */
export const updateManufacturerSchema = createManufacturerSchema.partial().strict();

/**
 * Schema per la validazione dell'ID manufacturer
 */
export const manufacturerIdSchema = z.object({
  id: manufacturerIdBaseSchema,
});

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const productQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  active: queryBooleanOrAllSchema(),
  categoryId: productCategoryIdBaseSchema.optional(),
  manufacturerId: manufacturerIdBaseSchema.optional(),
  supplierId: supplierIdBaseSchema.optional(),
  type: productTypeSchema.optional(),
  condition: productConditionSchema.optional(),
  minPrice: priceSchema().optional().nullable(),
  maxPrice: priceSchema().optional().nullable(),
  onSale: queryBooleanOrAllSchema(),
  sortBy: z.string().default("createdAt"),
  sortOrder: sortOrderSchema,
});
