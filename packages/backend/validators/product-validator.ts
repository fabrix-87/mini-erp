import {
  createManufacturerSchema,
  createProductCategorySchema,
  createProductImageSchema,
  createProductSchema,
  createProductVariantSchema,
  createProductTranslationSchema,
  manufacturerIdSchema,
  productCategoryIdSchema,
  productIdAsProductIdSchema,
  productIdSchema,
  productImageIdSchema,
  productQuerySchema,
  productVariantIdSchema,
  updateManufacturerSchema,
  updateProductImageSchema,
  updateProductSchema,
  updateProductVariantSchema,
  updateProductTranslationSchema,
  productIdLanguageIdSchema,
  productVariantDetailParamsSchema,
  MAX_PRODUCT_IMAGE_UPLOAD_FILES,
  MAX_PRODUCT_IMAGE_UPLOAD_FILE_BYTES,
  uploadProductImagesSchema,
} from "@mini-erp/shared";
import {
  validateBody,
  validateMultipartBody,
  validateParams,
  validateQuery,
} from "../middleware/validation-middleware";
import { bodyLimit } from "hono/body-limit";

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

/** Validates the payload for creating a product with its initial variants. */
export const validateCreateProduct = validateBody(createProductSchema, "Product creation");

/**
 * Middleware per l'aggiornamento di un prodotto
 */
export const validateUpdateProduct = validateBody(updateProductSchema, "Product update");

/** Validates the body for adding a variant to an existing product. */
export const validateCreateVariant = validateBody(
  createProductVariantSchema,
  "Product variant creation",
);

/**
 * Middleware per l'aggiornamento di una variante
 */
export const validateUpdateVariant = validateBody(
  updateProductVariantSchema,
  "Product variant update",
);

/**
 * Middleware per la validazione dell'ID prodotto (params)
 */
export const validateProductId = validateParams(productIdSchema, "Product ID validation");

/**
 * Middleware per la validazione dell'ID prodotto come productId (params)
 */
export const validateProductIdAsProductId = validateParams(
  productIdAsProductIdSchema,
  "Product ID validation",
);

/**
 * Middleware per la validazione dell'ID variante (params)
 */
export const validateVariantId = validateParams(
  productVariantIdSchema,
  "Product variant ID validation",
);

/**
 * Middleware per la creazione di una traduzione
 */
export const validateCreateTranslation = validateBody(
  createProductTranslationSchema,
  "Product translation creation",
);

/**
 * Middleware per l'aggiornamento di una traduzione
 */
export const validateUpdateTranslation = validateBody(
  updateProductTranslationSchema,
  "Product translation update",
);

/**
 * Validate productId, languageId
 */
export const validateProductIdLanguageId = validateParams(
  productIdLanguageIdSchema,
  "Product ID, Language ID",
);

/**
 * Middleware per la creazione di un'immagine
 */
export const validateCreateImage = validateBody(createProductImageSchema, "Product image creation");

const PRODUCT_IMAGE_MULTIPART_OVERHEAD_BYTES = 1024 * 1024;

const maxProductImageUploadBodyBytes =
  MAX_PRODUCT_IMAGE_UPLOAD_FILES * MAX_PRODUCT_IMAGE_UPLOAD_FILE_BYTES +
  PRODUCT_IMAGE_MULTIPART_OVERHEAD_BYTES;

/** Rejects oversized product image requests before multipart parsing. */
export const limitProductImageUploadBody = bodyLimit({
  maxSize: maxProductImageUploadBodyBytes,
  onError: (c) => c.json({ message: "La richiesta di upload non può superare 26 MiB" }, 413),
});

/** Validates multipart files and the optional variant ID for a product image upload. */
export const validateUploadProductImages = validateMultipartBody(
  uploadProductImagesSchema,
  "Product image upload",
  ["files"],
);

/**
 * Middleware per la validazione dell'ID immagine (params)
 */
export const validateProductImageId = validateParams(
  productImageIdSchema,
  "Product Image ID validation",
);

/**
 * Middleware per l'aggiornamento di un'immagine
 */
export const validateUpdateImage = validateBody(updateProductImageSchema, "Product image update");

/**
 * Middleware per l'associazione Product-Category
 */
export const validateCreateProductCategory = validateBody(
  createProductCategorySchema,
  "Product category association",
);

/**
 * Middleware per l'associazione Product-Category
 */
export const validatProductCategoryId = validateBody(
  productCategoryIdSchema,
  "Product/Category ID",
);

/**
 * Middleware per la creazione di un manufacturer
 */
export const validateCreateManufacturer = validateBody(
  createManufacturerSchema,
  "Manufacturer creation",
);

/**
 * Middleware per l'aggiornamento di un manufacturer
 */
export const validateUpdateManufacturer = validateBody(
  updateManufacturerSchema,
  "Manufacturer update",
);

/**
 * Middleware per la validazione dell'ID di un manufacturer (params)
 */
export const validateManufacturerId = validateParams(manufacturerIdSchema, "Product ID validation");

/**
 * Middleware per i filtri e paginazione ricerca prodotti
 */
export const validateProductQuery = validateQuery(productQuerySchema, "Product Query");

/** Validates the product and variant IDs from a nested variant route. */
export const validateProductVariantDetailParams = validateParams(
  productVariantDetailParamsSchema,
  "Product variant detail parameters",
);
