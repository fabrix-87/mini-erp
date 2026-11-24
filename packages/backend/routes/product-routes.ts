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
  validateProductVariantDetailParams,
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
  activateProduct,
  archiveProduct,
} from "../controllers/product-controller";
import { createHonoApp } from "@/lib/hono-app";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const productRoutes = createHonoApp();

// ============================================================================
// PRODUCT TRANSLATIONS
// ============================================================================

/**
 * @route   GET /api/products/:id/translations
 * @desc    Lista traduzioni di un prodotto
 * @access  Public
 */
productRoutes.get(
  "/:id/translations",
  authorize(["product:read", "product:manage"]),
  requireTenantScope,
  validateProductId,
  getProductTranslations,
);
/**
 * @route   POST /api/products/:id/translations
 * @desc    Crea una traduzione per un prodotto
 * @access  Private (Admin, Product Manager)
 */
productRoutes.post(
  "/:id/translations",
  authorize(["product:create", "product:manage"]),
  requireTenantScope,
  validateProductId,
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
  authorize(["product:update", "product:manage"]),
  requireTenantScope,
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
  authorize(["product:delete", "product:manage"]),
  requireTenantScope,
  validateProductIdLanguageId,
  deleteProductTranslation,
);

// ============================================================================
// PUBLIC ROUTES - Products
// ============================================================================

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

// ============================================================================
// PRODUCT VARIANTS
// ============================================================================

/**
 * @route   GET /api/products/:id/variants
 * @desc    Lists the visible variants of a product in the current tenant.
 * @access  Private (product:read, product:manage)
 */
productRoutes.get(
  "/:id/variants",
  authorize(["product:read", "product:manage"]),
  requireTenantScope,
  validateProductId,
  getProductVariants,
);

/**
 * @route   GET /api/products/:productId/variants/:id
 * @desc    Returns a variant belonging to the product identified by the route
 * @access  Private (product:read, product:manage)
 */
productRoutes.get(
  "/:productId/variants/:id",
  authorize(["product:read", "product:manage"]),
  requireTenantScope,
  validateProductVariantDetailParams,
  getVariantById,
);

/**
 * @desc    Creates a variant for the product identified by the route.
 * @route   POST /api/products/:id/variants
 * @access  Private (product:create, product:manage)
 */
productRoutes.post(
  "/:id/variants",
  authorize(["product:create", "product:manage"]),
  requireTenantScope,
  validateProductId,
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
  authorize(["product:update", "product:manage"]),
  requireTenantScope,
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
  authorize(["product:delete", "product:manage"]),
  requireTenantScope,
  validateProductIdAsProductId,
  validateVariantId,
  deleteVariant,
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
// PRODUCT ROUTES
// ============================================================================

/**
 * @desc    Activates a draft product or reactivates an archived product
 * @route   POST /:id/activate
 * @access  Private (product:update, product:manage)
 */
productRoutes.post(
  "/:id/activate",
  authorize(["product:update", "product:manage"]),
  requireTenantScope,
  validateProductId,
  activateProduct,
);

/**
 * @route   POST /api/products/:id/archive
 * @desc    Archives an active product without removing its historical references.
 * @access  Private (product:update, product:manage)
 */
productRoutes.post(
  "/:id/archive",
  authorize(["product:update", "product:manage"]),
  requireTenantScope,
  validateProductId,
  archiveProduct,
);

/**
 * @route   GET /api/products
 * @desc    Lista tutti i prodotti con filtri e paginazione
 * @access  Private (product:read, product:manage)
 * @query   page, limit, search, active, categoryId, manufacturerId, minPrice, maxPrice, sortBy, sortOrder
 */
productRoutes.get(
  "/",
  authorize(["product:read", "product:manage"]),
  requireTenantScope,
  validateProductQuery,
  getAllProducts,
);

/**
 * @route   GET /api/products/:id
 * @desc    Ottieni dettagli prodotto con varianti, traduzioni e immagini
 * @access  Private (product:read, product:manage)
 */
productRoutes.get(
  "/:id",
  authorize(["product:read", "product:manage"]),
  requireTenantScope,
  validateProductId,
  getProductById,
);

/**
 * @route   POST /api/products
 * @desc    Crea un nuovo prodotto
 * @access  Private (product:create, product:manage)
 */
productRoutes.post(
  "/",
  authorize(["product:create", "product:manage"]),
  requireTenantScope,
  validateCreateProduct,
  createProduct,
);

/**
 * @route   PUT /api/products/:id
 * @desc    Aggiorna un prodotto
 * @access  Private (product:update, product:manage)
 */
productRoutes.put(
  "/:id",
  authorize(["product:update", "product:manage"]),
  requireTenantScope,
  validateProductId,
  validateUpdateProduct,
  updateProduct,
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Elimina un prodotto
 * @access  Private (product:delete, product:manage)
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
// EXPORT
// ============================================================================

export default productRoutes;
