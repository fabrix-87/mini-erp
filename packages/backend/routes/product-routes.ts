import { authorize } from "../middleware/auth-middleware";
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
  validateCreateVariant,
  validateUpdateVariant,
  validateVariantId,
  validateCreateTranslation,
  validateUpdateTranslation,
  validateCreateImage,
  validateUpdateImage,
  validateCreateProductCategory,
  validateCreateManufacturer,
  validateUpdateManufacturer,
  validateProductImageId,
  validateManufacturerId,
  validateProductQuery,
  validateProductIdLanguageId,
  validatProductCategoryId,
  validateProductIdAsProductId,
} from "../validators/product-validator";
import {
  // Products
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  // Variants
  getProductVariants,
  getVariantById,
  createVariant,
  updateVariant,
  deleteVariant,
  // Translations
  getProductTranslations,
  createProductTranslation,
  updateProductTranslation,
  deleteProductTranslation,
  // Images
  getProductImages,
  createImage,
  updateImage,
  deleteImage,
  setCoverImage,
  // Categories
  getProductCategories,
  addCategory,
  removeCategory,
  updateCategoryPosition,
  // Manufacturers
  getAllManufacturers,
  getManufacturerById,
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
  // Bulk operations
  bulkUpdateProducts,
  bulkDeleteProducts,
} from "../controllers/product-controller";
import { createHonoApp } from "@/lib/hono-app";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const productRoutes = createHonoApp();

// ============================================================================
// PUBLIC ROUTES - Products
// ============================================================================

/**
 * @route   GET /api/products
 * @desc    Lista tutti i prodotti con filtri e paginazione
 * @access  Public
 * @query   page, limit, search, active, categoryId, manufacturerId, minPrice, maxPrice, sortBy, sortOrder
 */
productRoutes.get("/", validateProductQuery, getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Ottieni dettagli prodotto con varianti, traduzioni e immagini
 * @access  Public
 */
productRoutes.get("/:id", validateProductId, getProductById);

/**
 * @route   GET /api/products/:id/variants
 * @desc    Lista varianti di un prodotto
 * @access  Public
 */
productRoutes.get("/:id/variants", validateProductId, getProductVariants);

/**
 * @route   GET /api/products/:id/images
 * @desc    Lista immagini di un prodotto
 * @access  Public
 */
productRoutes.get("/:id/images", validateProductId, getProductImages);

/**
 * @route   GET /api/products/:id/categories
 * @desc    Lista categorie di un prodotto
 * @access  Public
 */
productRoutes.get("/:id/categories", validateProductId, getProductCategories);

/**
 * @route   GET /api/products/:id/translations
 * @desc    Lista traduzioni di un prodotto
 * @access  Public
 */
productRoutes.get("/:id/translations", validateProductId, getProductTranslations);

// ============================================================================
// ADMIN ROUTES - Product Management
// ============================================================================

/**
 * @route   POST /api/products
 * @desc    Crea un nuovo prodotto
 * @access  Private (Admin, Product Manager)
 */
productRoutes.post(
  "/",
  requireTenantScope,
  authorize(["product:create", "product:manage"]),
  validateCreateProduct,
  createProduct,
);

/**
 * @route   PUT /api/products/:id
 * @desc    Aggiorna un prodotto
 * @access  Private (Admin, Product Manager)
 */
productRoutes.put(
  "/:id",
  requireTenantScope,
  authorize(["product:update", "product:manage"]),
  validateProductId,
  validateUpdateProduct,
  updateProduct,
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Elimina un prodotto
 * @access  Private (Admin)
 */
productRoutes.delete(
  "/:id",
  requireTenantScope,
  authorize(["product:delete", "product:manage"]),
  validateProductId,
  deleteProduct,
);

/**
 * @route   POST /api/products/bulk-update
 * @desc    Aggiorna multipli prodotti
 * @access  Private (Admin, Product Manager)
 */
productRoutes.post(
  "/bulk-update",
  requireTenantScope,
  authorize(["product:update", "product:manage"]),
  bulkUpdateProducts,
);

/**
 * @route   POST /api/products/bulk-delete
 * @desc    Elimina multipli prodotti
 * @access  Private (Admin)
 */
productRoutes.post(
  "/bulk-delete",
  requireTenantScope,
  authorize(["product:delete", "product:manage"]),
  bulkDeleteProducts,
);

// ============================================================================
// PRODUCT VARIANTS
// ============================================================================

/**
 * @route   GET /api/products/:productId/variants/:id
 * @desc    Ottieni dettagli variante
 * @access  Public
 */
productRoutes.get("/:productId/variants/:id", validateVariantId, getVariantById);

/**
 * @route   POST /api/products/:id/variants
 * @desc    Crea una nuova variante
 * @access  Private (Admin, Product Manager)
 */
productRoutes.post(
  "/:id/variants",
  requireTenantScope,
  authorize(["product:create", "product:manage"]),
  validateCreateVariant,
  createVariant,
);

/**
 * @route   PUT /api/products/:productId/variants/:id
 * @desc    Aggiorna una variante
 * @access  Private (Admin, Product Manager)
 */
productRoutes.put(
  "/:productId/variants/:id",
  requireTenantScope,
  authorize(["product:update", "product:manage"]),
  validateVariantId,
  validateUpdateVariant,
  updateVariant,
);

/**
 * @route   DELETE /api/products/:productId/variants/:id
 * @desc    Elimina una variante
 * @access  Private (Admin)
 */
productRoutes.delete(
  "/:productId/variants/:id",
  requireTenantScope,
  authorize(["product:delete", "product:manage"]),
  validateProductIdAsProductId,
  validateVariantId,
  deleteVariant,
);

// ============================================================================
// PRODUCT TRANSLATIONS
// ============================================================================

/**
 * @route   POST /api/products/:id/translations
 * @desc    Crea una traduzione per un prodotto
 * @access  Private (Admin, Product Manager)
 */
productRoutes.post(
  "/:id/translations",
  requireTenantScope,
  authorize(["product:create", "product:manage"]),
  validateCreateTranslation,
  createProductTranslation,
);

/**
 * @route   PUT /api/products/:id/translations/:languageId
 * @desc    Aggiorna una traduzione
 * @access  Private (Admin, Product Manager)
 */
productRoutes.put(
  "/:id/translations/:languageId",
  requireTenantScope,
  authorize(["product:update", "product:manage"]),
  validateProductIdLanguageId,
  validateUpdateTranslation,
  updateProductTranslation,
);

/**
 * @route   DELETE /api/products/:id/translations/:languageId
 * @desc    Elimina una traduzione
 * @access  Private (Admin, Product Manager)
 */
productRoutes.delete(
  "/:id/translations/:languageId",
  requireTenantScope,
  authorize(["product:delete", "product:manage"]),
  validateProductIdLanguageId,
  deleteProductTranslation,
);

// ============================================================================
// PRODUCT IMAGES
// ============================================================================

/**
 * @route   POST /api/products/:id/images
 * @desc    Aggiungi un'immagine al prodotto
 * @access  Private (Admin, Product Manager)
 */
productRoutes.post(
  "/:id/images",
  requireTenantScope,
  authorize(["product:create", "product:manage"]),
  validateProductId,
  validateCreateImage,
  createImage,
);

/**
 * @route   PUT /api/products/:productId/images/:id
 * @desc    Aggiorna un'immagine
 * @access  Private (Admin, Product Manager)
 */
productRoutes.put(
  "/:productId/images/:id",
  requireTenantScope,
  authorize(["product:update", "product:manage"]),
  validateProductImageId,
  validateUpdateImage,
  updateImage,
);

/**
 * @route   DELETE /api/products/:productId/images/:id
 * @desc    Elimina un'immagine
 * @access  Private (Admin, Product Manager)
 */
productRoutes.delete(
  "/:productId/images/:id",
  requireTenantScope,
  authorize(["product:delete", "product:manage"]),
  validateProductImageId,
  deleteImage,
);

/**
 * @route   PATCH /api/products/:productId/images/:id/set-cover
 * @desc    Imposta un'immagine come cover
 * @access  Private (Admin, Product Manager)
 */
productRoutes.patch(
  "/:productId/images/:id/set-cover",
  requireTenantScope,
  authorize(["product:update", "product:manage"]),
  validateProductImageId,
  setCoverImage,
);

// ============================================================================
// PRODUCT CATEGORIES
// ============================================================================

/**
 * @route   POST /api/products/:id/categories
 * @desc    Associa una categoria al prodotto
 * @access  Private (Admin, Product Manager)
 */
productRoutes.post(
  "/:id/categories",
  requireTenantScope,
  authorize(["product:update", "product:manage"]),
  validateProductId,
  validateCreateProductCategory,
  addCategory,
);

/**
 * @route   DELETE /api/products/:productId/categories/:categoryId
 * @desc    Rimuovi categoria dal prodotto
 * @access  Private (Admin, Product Manager)
 */
productRoutes.delete(
  "/:productId/categories/:categoryId",
  requireTenantScope,
  authorize(["product:update", "product:manage"]),
  validatProductCategoryId,
  removeCategory,
);

/**
 * @route   PATCH /api/products/:productId/categories/:categoryId/position
 * @desc    Aggiorna posizione categoria
 * @access  Private (Admin, Product Manager)
 */
productRoutes.patch(
  "/:productId/categories/:categoryId/position",
  requireTenantScope,
  authorize(["product:update", "product:manage"]),
  validatProductCategoryId,
  updateCategoryPosition,
);

// ============================================================================
// MANUFACTURERS
// ============================================================================

/**
 * @route   GET /api/products/manufacturers
 * @desc    Lista tutti i produttori
 * @access  Public
 */
productRoutes.get("/manufacturers", getAllManufacturers);

/**
 * @route   GET /api/products/manufacturers/:id
 * @desc    Ottieni dettagli produttore
 * @access  Public
 */
productRoutes.get("/manufacturers/:id", validateManufacturerId, getManufacturerById);

/**
 * @route   POST /api/products/manufacturers
 * @desc    Crea un nuovo produttore
 * @access  Private (Admin, Product Manager)
 */
productRoutes.post(
  "/manufacturers",
  requireTenantScope,
  authorize(["product:create", "product:manage"]),
  validateCreateManufacturer,
  createManufacturer,
);

/**
 * @route   PUT /api/products/manufacturers/:id
 * @desc    Aggiorna un produttore
 * @access  Private (Admin, Product Manager)
 */
productRoutes.put(
  "/manufacturers/:id",
  requireTenantScope,
  authorize(["product:update", "product:manage"]),
  validateManufacturerId,
  validateUpdateManufacturer,
  updateManufacturer,
);

/**
 * @route   DELETE /api/products/manufacturers/:id
 * @desc    Elimina un produttore
 * @access  Private (Admin)
 */
productRoutes.delete(
  "/manufacturers/:id",
  requireTenantScope,
  authorize(["product:delete", "product:manage"]),
  validateManufacturerId,
  deleteManufacturer,
);

// ============================================================================
// EXPORT
// ============================================================================

export default productRoutes;
