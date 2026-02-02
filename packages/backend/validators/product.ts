import {
  CreateManufacturerSchema,
  CreateProductCategorySchema,
  CreateProductImageSchema,
  CreateProductSchema,
  CreateProductTranslationSchema,
  CreateProductVariantSchema,
  ManufacturerIdSchema,
  ProductCategoryIdSchema,
  ProductIdLanguageSchema,
  ProductIdSchema,
  ProductImageIdSchema,
  ProductQuerySchema,
  ProductVariantIdSchema,
  UpdateManufacturerSchema,
  UpdateProductImageSchema,
  UpdateProductSchema,
  UpdateProductTranslationSchema,
  UpdateProductVariantSchema,
} from "@mini-erp/shared";
import { validateBody, validateParams } from "../middleware/validation";

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Middleware per la creazione di un prodotto
 */
export const validateCreateProduct = validateBody(
  CreateProductSchema,
  "Product creation",
);

/**
 * Middleware per l'aggiornamento di un prodotto
 */
export const validateUpdateProduct = validateBody(
  UpdateProductSchema,
  "Product update",
);

/**
 * Middleware per la creazione di una variante
 */
export const validateCreateVariant = validateBody(
  CreateProductVariantSchema,
  "Product variant creation",
);

/**
 * Middleware per l'aggiornamento di una variante
 */
export const validateUpdateVariant = validateBody(
  UpdateProductVariantSchema,
  "Product variant update",
);

/**
 * Middleware per la validazione dell'ID prodotto (params)
 */
export const validateProductId = validateParams(
  ProductIdSchema,
  "Product ID validation",
);

/**
 * Middleware per la validazione dell'ID prodotto con ID lingua (params)
 */
export const validateProductIdLanguageId = validateParams(
  ProductIdLanguageSchema,
  "Product/Language ID validation",
);

/**
 * Middleware per la validazione dell'ID variante (params)
 */
export const validateVariantId = validateParams(
  ProductVariantIdSchema,
  "Product variant ID validation",
);

/**
 * Middleware per la creazione di una traduzione
 */
export const validateCreateTranslation = validateBody(
  CreateProductTranslationSchema,
  "Product translation creation",
);

/**
 * Middleware per l'aggiornamento di una traduzione
 */
export const validateUpdateTranslation = validateBody(
  UpdateProductTranslationSchema,
  "Product translation update",
);

/**
 * Middleware per la creazione di un'immagine
 */
export const validateCreateImage = validateBody(
  CreateProductImageSchema,
  "Product image creation",
);

/**
 * Middleware per la validazione dell'ID immagine (params)
 */
export const validateProductImageId = validateParams(
  ProductImageIdSchema,
  "Product Image ID validation",
);

/**
 * Middleware per l'aggiornamento di un'immagine
 */
export const validateUpdateImage = validateBody(
  UpdateProductImageSchema,
  "Product image update",
);

/**
 * Middleware per l'associazione Product-Category
 */
export const validateCreateProductCategory = validateBody(
  CreateProductCategorySchema,
  "Product category association",
);

/**
 * Middleware per l'associazione Product-Category
 */
export const validatProductCategoryId = validateBody(
  ProductCategoryIdSchema,
  "Product/Category ID",
);

/**
 * Middleware per la creazione di un manufacturer
 */
export const validateCreateManufacturer = validateBody(
  CreateManufacturerSchema,
  "Manufacturer creation",
);

/**
 * Middleware per l'aggiornamento di un manufacturer
 */
export const validateUpdateManufacturer = validateBody(
  UpdateManufacturerSchema,
  "Manufacturer update",
);

/**
 * Middleware per la validazione dell'ID di un manufacturer (params)
 */
export const validateManufacturerId = validateParams(
  ManufacturerIdSchema,
  "Product ID validation",
);

/**
 * Middleware per i filtri e paginazione ricerca prodotti
 */
export const validateProductQuery = validateBody(
  ProductQuerySchema,
  "Product Query"
)