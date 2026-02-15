import { z } from "zod";
import { createIdSchema } from "./primitives/id";
import { isoDateSchema } from "./primitives/date";
import { priceSchema } from "./business/currency";
import Decimal from "decimal.js";
import { inputJsonValueSchema } from "./base";
import { limitSchema, pageSchema, sortOrderSchema } from "./query/pagination";
import { queryBooleanSchema } from "./query/params";
import { urlSchema } from "./primitives";

// ============================================================================
// ENUMS
// ============================================================================

export const productTypeSchema = z.enum([
  "STANDARD",
  "PACK",
  "VIRTUAL",
  "SERVICE",
]);
export const productConditionSchema = z.enum(["NEW", "USED", "REFURBISHED"]);
export const productStatusSchema = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);

// ============================================================================
// PRODUCT VARIANT SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di una ProductVariant
 */
export const createProductVariantSchema = z
  .object({
    productId: createIdSchema("ID prodotto obbligatorio"),

    // Identificatori univoci
    variantCode: z
      .string()
      .min(1, "Il codice variante è obbligatorio")
      .max(64, "Il codice variante non può superare 64 caratteri")
      .trim(),
    sku: z.string().max(64).optional().nullable(),

    // Codici a barre
    ean13: z.string().max(13).optional().nullable(),
    upc: z.string().max(12).optional().nullable(),
    isbn: z.string().max(32).optional().nullable(),
    mpn: z.string().max(40).optional().nullable(),

    // Stock e magazzino
    quantity: z.number().int().default(0),
    minimalQuantity: z.number().int().positive().default(1),
    lowStockThreshold: z.number().int().nonnegative().default(0),
    lowStockAlertEnabled: z.boolean().default(false),
    location: z.string().max(50).optional().nullable(),

    packStockType: z.number().int().default(0),
    outOfStockType: z.number().int().default(0),
    availableDate: isoDateSchema(),

    // Prezzi specifici
    price: priceSchema({ precision: 6 }).optional().nullable(),
    wholesalePrice: priceSchema({ precision: 6 }).optional().nullable(),
    unitPriceRatio: priceSchema({ precision: 6 }).default(new Decimal(0)),

    // Dimensioni fisiche
    weight: z.number().nonnegative().default(0).optional().nullable(),
    width: z.number().nonnegative().default(0).optional().nullable(),
    height: z.number().nonnegative().default(0).optional().nullable(),
    depth: z.number().nonnegative().default(0).optional().nullable(),

    // Codice nomenclatura combinata
    commodityCode: z.string().optional().nullable(),

    // Media
    coverImageUrl: z.string().max(500).optional().nullable(),

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
  id: createIdSchema("ID variante non valido"),
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
    defaultTaxRuleId: createIdSchema(
      "L'ID della regola fiscale è obbligatorio",
    ),

    // Visibilità
    visibility: z.string().max(20).default("both"),
    condition: productConditionSchema.default("NEW"),
    showCondition: z.boolean().default(false),

    // Relazioni opzionali
    manufacturerId: createIdSchema("Manufacturer ID non valido")
      .optional()
      .nullable(),
    supplierId: createIdSchema("Supplier ID non valido").optional().nullable(),

    // Logistica
    additionalShippingCost: priceSchema({ defaultValue: 0 }),
    carrierReferenceIds: z.any().optional().nullable(),
    deliveryTimeNoteType: z.number().int().default(0),

    // Redirect e SEO
    redirectType: z.string().max(10).default("404"),
    redirectTarget: z.number().int().default(0),

    // Media
    coverThumbnailUrl: z.string().max(500).optional().nullable(),

    // VARIANTI OBBLIGATORIE
    variants: z
      .array(createProductVariantSchema.omit({ productId: true }))
      .min(1, "Almeno una variante è obbligatoria")
      .refine(
        (variants) =>
          variants.some((v) => v.isDefault === true) || variants.length === 1,
        { message: "Almeno una variante deve essere impostata come default" },
      ),
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
  id: createIdSchema("ID prodotto non valido"),
});

// ============================================================================
// PRODUCT VARIANT TRANSLATION SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di una ProductVariantTranslation
 */
export const createProductVariantTranslationSchema = z
  .object({
    productVariantId: createIdSchema("ID variante prodotto obbligatorio"),
    languageId: createIdSchema("ID lingua obbligatorio"),

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
    linkRewrite: z.string().max(255).optional().nullable(),

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
export const updateProductVariantTranslationSchema =
  createProductVariantTranslationSchema
    .omit({ productVariantId: true, languageId: true })
    .partial()
    .strict();

// ============================================================================
// PRODUCT IMAGE SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di una ProductImage
 */
export const createProductImageSchema = z
  .object({
    productId: createIdSchema("ID prodotto obbligatorio"),
    variantId: createIdSchema("ID variante").optional().nullable(),

    imageUrl: urlSchema(),
    imageType: z.string().max(20).default("extra"),
    position: z.number().int().default(0),
    isCover: z.boolean().default(false),

    altText: z.any().optional().nullable(),

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
  id: createIdSchema("ID immagine non valido"),
  productId: createIdSchema("ID Prodotto non valido"),
});

// ============================================================================
// PRODUCT CATEGORY SCHEMAS
// ============================================================================

/**
 * Schema per l'associazione Product-Category
 */
export const createProductCategorySchema = z
  .object({
    productId: createIdSchema("ID prodotto obbligatorio"),
    categoryId: createIdSchema("ID categoria obbligatorio"),
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
  categoryId: createIdSchema("ID Categoria non valido"),
  productId: createIdSchema("ID Prodotto non valido"),
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
export const updateManufacturerSchema = createManufacturerSchema
  .partial()
  .strict();

/**
 * Schema per la validazione dell'ID manufacturer
 */
export const manufacturerIdSchema = z.object({
  id: createIdSchema("ID manufacturer non valido"),
});

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const productQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  active: queryBooleanSchema,
  categoryId: createIdSchema("Category ID non valido").optional(),
  manufacturerId: createIdSchema("Manufacturer ID non valido").optional(),
  supplierId: createIdSchema("Supplier ID non valido").optional(),
  type: productTypeSchema,
  condition: productConditionSchema,
  minPrice: priceSchema().optional().nullable(),
  maxPrice: priceSchema().optional().nullable(),
  onSale: queryBooleanSchema,
  sortBy: z.string().default("createdAt"),
  sortOrder: sortOrderSchema,
});
