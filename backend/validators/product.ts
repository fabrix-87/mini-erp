import { z } from "zod";
import { handleZodError } from "../helpers/validate";
import { validateBody, validateParams } from "../middleware/validation";

// ============================================================================
// ENUMS
// ============================================================================

export const ProductTypeSchema = z.enum(["STANDARD", "PACK", "VIRTUAL"]);
export const ProductConditionSchema = z.enum(["NEW", "USED", "REFURBISHED"]);

// ============================================================================
// PRODUCT VARIANT SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di una ProductVariant
 */
export const CreateProductVariantSchema = z
  .object({
    productId: z.number().int().positive("ID prodotto obbligatorio"),

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
    availableDate: z
      .string()
      .datetime()
      .optional()
      .nullable()
      .or(z.date().optional().nullable()),

    // Prezzi specifici
    price: z.number().nonnegative().optional().nullable(),
    wholesalePrice: z.number().nonnegative().optional().nullable(),
    unitPriceRatio: z.number().nonnegative().default(0),

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

    metadata: z.any().optional().nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento di una ProductVariant
 */
export const UpdateProductVariantSchema = CreateProductVariantSchema.omit({
  productId: true,
})
  .partial()
  .strict();

/**
 * Schema per la validazione dell'ID variante
 */
export const ProductVariantIdSchema = z.object({
  id: z.number().int().positive("ID variante non valido"),
});

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un nuovo Product
 */
export const CreateProductSchema = z
  .object({
    type: ProductTypeSchema.default("STANDARD"),
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
    price: z.number().nonnegative("Il prezzo deve essere positivo").default(0),
    wholesalePrice: z
      .number()
      .nonnegative("Il prezzo all'ingrosso deve essere positivo")
      .default(0),
    ecotax: z.number().nonnegative("L'ecotax deve essere positivo").default(0),

    // Tassazione
    defaultTaxRuleId: z
      .number()
      .int()
      .positive("L'ID della regola fiscale è obbligatorio"),

    // Visibilità
    visibility: z.string().max(20).default("both"),
    condition: ProductConditionSchema.default("NEW"),
    showCondition: z.boolean().default(false),

    // Relazioni opzionali
    manufacturerId: z.number().int().positive().optional().nullable(),
    supplierId: z.number().int().positive().optional().nullable(),

    // Logistica
    additionalShippingCost: z.number().nonnegative().default(0),
    carrierReferenceIds: z.any().optional().nullable(),
    deliveryTimeNoteType: z.number().int().default(0),

    // Redirect e SEO
    redirectType: z.string().max(10).default("404"),
    redirectTarget: z.number().int().default(0),

    // Media
    coverThumbnailUrl: z.string().max(500).optional().nullable(),

    // ✅ VARIANTI OBBLIGATORIE
    variants: z
      .array(CreateProductVariantSchema.omit({ productId: true }))
      .min(1, "Almeno una variante è obbligatoria")
      .refine(
        (variants) =>
          variants.some((v) => v.isDefault === true) || variants.length === 1,
        { message: "Almeno una variante deve essere impostata come default" }
      ),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un Product
 */
export const UpdateProductSchema = CreateProductSchema.partial().strict();

/**
 * Schema per la validazione dell'ID prodotto
 */
export const ProductIdSchema = z.object({
  id: z.number().int().positive("ID prodotto non valido"),
});

// ============================================================================
// PRODUCT TRANSLATION SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di una ProductTranslation
 */
export const CreateProductTranslationSchema = z
  .object({
    productId: z.number().int().positive("ID prodotto obbligatorio"),
    languageId: z.number().int().positive("ID lingua obbligatorio"),

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
 * Schema per l'aggiornamento di una ProductTranslation
 */
export const UpdateProductTranslationSchema =
  CreateProductTranslationSchema.omit({ productId: true, languageId: true })
    .partial()
    .strict();

// ============================================================================
// PRODUCT IMAGE SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di una ProductImage
 */
export const CreateProductImageSchema = z
  .object({
    productId: z.number().int().positive("ID prodotto obbligatorio"),

    imageUrl: z
      .string()
      .min(1, "L'URL dell'immagine è obbligatorio")
      .max(500, "L'URL non può superare 500 caratteri")
      .url("URL non valido"),
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
export const UpdateProductImageSchema = CreateProductImageSchema.omit({
  productId: true,
})
  .partial()
  .strict();

/**
 * Schema per la validazione dell'ID immagine
 */
export const ProductImageIdSchema = z.object({
  id: z.number().int().positive("ID immagine non valido"),
});

// ============================================================================
// PRODUCT CATEGORY SCHEMAS
// ============================================================================

/**
 * Schema per l'associazione Product-Category
 */
export const CreateProductCategorySchema = z
  .object({
    productId: z.number().int().positive("ID prodotto obbligatorio"),
    categoryId: z.number().int().positive("ID categoria obbligatorio"),
    position: z.number().int().default(0),
  })
  .strict();

/**
 * Schema per l'aggiornamento della posizione Product-Category
 */
export const UpdateProductCategorySchema = z
  .object({
    position: z.number().int(),
  })
  .strict();

// ============================================================================
// MANUFACTURER SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un Manufacturer
 */
export const CreateManufacturerSchema = z
  .object({
    name: z.string().min(1, "Il nome è obbligatorio").trim(),
    active: z.boolean().default(true),
    customFields: z.any().optional().nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un Manufacturer
 */
export const UpdateManufacturerSchema =
  CreateManufacturerSchema.partial().strict();

/**
 * Schema per la validazione dell'ID manufacturer
 */
export const ManufacturerIdSchema = z.object({
  id: z.number().int().positive("ID manufacturer non valido"),
});

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Middleware per la creazione di un prodotto
 */
export const validateCreateProductMiddleware = validateBody(
  CreateProductSchema,
  "Product creation"
);

/**
 * Middleware per l'aggiornamento di un prodotto
 */
export const validateUpdateProductMiddleware = validateBody(
  UpdateProductSchema,
  "Product update"
);

/**
 * Middleware per la creazione di una variante
 */
export const validateCreateVariantMiddleware = validateBody(
  CreateProductVariantSchema,
  "Product variant creation"
);

/**
 * Middleware per l'aggiornamento di una variante
 */
export const validateUpdateVariantMiddleware = validateBody(
  UpdateProductVariantSchema,
  "Product variant update"
);

/**
 * Middleware per la validazione dell'ID prodotto (params)
 */
export const validateProductIdMiddleware = validateParams(
  ProductIdSchema,
  "Product ID validation"
);

/**
 * Middleware per la validazione dell'ID variante (params)
 */
export const validateVariantIdMiddleware = validateParams(
  ProductVariantIdSchema,
  "Product variant ID validation"
);

/**
 * Middleware per la creazione di una traduzione
 */
export const validateCreateTranslationMiddleware = validateBody(
  CreateProductTranslationSchema,
  "Product translation creation"
);

/**
 * Middleware per l'aggiornamento di una traduzione
 */
export const validateUpdateTranslationMiddleware = validateBody(
  UpdateProductTranslationSchema,
  "Product translation update"
);

/**
 * Middleware per la creazione di un'immagine
 */
export const validateCreateImageMiddleware = validateBody(
  CreateProductImageSchema,
  "Product image creation"
);

/**
 * Middleware per la validazione dell'ID immagine (params)
 */
export const validateProductImageIdMiddleware = validateParams(
  ProductImageIdSchema,
  "Product Image ID validation"
);

/**
 * Middleware per l'aggiornamento di un'immagine
 */
export const validateUpdateImageMiddleware = validateBody(
  UpdateProductImageSchema,
  "Product image update"
);

/**
 * Middleware per l'associazione Product-Category
 */
export const validateCreateProductCategoryMiddleware = validateBody(
  CreateProductCategorySchema,
  "Product category association"
);

/**
 * Middleware per la creazione di un manufacturer
 */
export const validateCreateManufacturerMiddleware = validateBody(
  CreateManufacturerSchema,
  "Manufacturer creation"
);

/**
 * Middleware per l'aggiornamento di un manufacturer
 */
export const validateUpdateManufacturerMiddleware = validateBody(
  UpdateManufacturerSchema,
  "Manufacturer update"
);

/**
 * Middleware per la validazione dell'ID di un manufacturer (params)
 */
export const validateManufacturerIdMiddleware = validateParams(
  ManufacturerIdSchema,
  "Product ID validation"
);

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Valida i dati per la creazione di un prodotto
 */
export const validateCreateProduct = (data: unknown) => {
  try {
    return CreateProductSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, "Product creation");
    }
    throw error;
  }
};

/**
 * Valida i dati per l'aggiornamento di un prodotto
 */
export const validateUpdateProduct = (data: unknown) => {
  try {
    return UpdateProductSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, "Product update");
    }
    throw error;
  }
};

/**
 * Valida i dati per la creazione di una variante
 */
export const validateCreateVariant = (data: unknown) => {
  try {
    return CreateProductVariantSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, "Product variant creation");
    }
    throw error;
  }
};

/**
 * Valida i dati per l'aggiornamento di una variante
 */
export const validateUpdateVariant = (data: unknown) => {
  try {
    return UpdateProductVariantSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, "Product variant update");
    }
    throw error;
  }
};

/**
 * Valida i dati per la creazione di una traduzione
 */
export const validateCreateTranslation = (data: unknown) => {
  try {
    return CreateProductTranslationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, "Product translation creation");
    }
    throw error;
  }
};

/**
 * Valida i dati per la creazione di un'immagine
 */
export const validateCreateImage = (data: unknown) => {
  try {
    return CreateProductImageSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, "Product image creation");
    }
    throw error;
  }
};

/**
 * Valida i dati per la creazione di un manufacturer
 */
export const validateCreateManufacturer = (data: unknown) => {
  try {
    return CreateManufacturerSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, "Manufacturer creation");
    }
    throw error;
  }
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreateProductVariantInput = z.infer<
  typeof CreateProductVariantSchema
>;
export type UpdateProductVariantInput = z.infer<
  typeof UpdateProductVariantSchema
>;
export type CreateProductTranslationInput = z.infer<
  typeof CreateProductTranslationSchema
>;
export type UpdateProductTranslationInput = z.infer<
  typeof UpdateProductTranslationSchema
>;
export type CreateProductImageInput = z.infer<typeof CreateProductImageSchema>;
export type UpdateProductImageInput = z.infer<typeof UpdateProductImageSchema>;
export type CreateProductCategoryInput = z.infer<
  typeof CreateProductCategorySchema
>;
export type UpdateProductCategoryInput = z.infer<
  typeof UpdateProductCategorySchema
>;
export type CreateManufacturerInput = z.infer<typeof CreateManufacturerSchema>;
export type UpdateManufacturerInput = z.infer<typeof UpdateManufacturerSchema>;
export type ProductType = z.infer<typeof ProductTypeSchema>;
export type ProductCondition = z.infer<typeof ProductConditionSchema>;
