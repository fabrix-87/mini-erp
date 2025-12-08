import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import {
  validateCreateProductMiddleware,
  validateUpdateProductMiddleware,
  validateProductIdMiddleware,
  validateCreateVariantMiddleware,
  validateUpdateVariantMiddleware,
  validateVariantIdMiddleware,
  validateCreateTranslationMiddleware,
  validateUpdateTranslationMiddleware,
  validateCreateImageMiddleware,
  validateUpdateImageMiddleware,
  validateCreateProductCategoryMiddleware,
  validateCreateManufacturerMiddleware,
  validateUpdateManufacturerMiddleware,
  validateProductImageIdMiddleware,
  validateManufacturerIdMiddleware,
} from '../validators/product';
import {
  // Products
  getAllProducts,
  getProductById,
  createProduct,
  createSimpleProduct,
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
  createTranslation,
  updateTranslation,
  deleteTranslation,
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
} from '../controllers/product';

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES - Products
// ============================================================================

/**
 * @route   GET /api/products
 * @desc    Lista tutti i prodotti con filtri e paginazione
 * @access  Public
 * @query   page, limit, search, active, categoryId, manufacturerId, minPrice, maxPrice, sortBy, sortOrder
 */
router.get('/', getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Ottieni dettagli prodotto con varianti, traduzioni e immagini
 * @access  Public
 */
router.get('/:id', validateProductIdMiddleware, getProductById);

/**
 * @route   GET /api/products/:id/variants
 * @desc    Lista varianti di un prodotto
 * @access  Public
 */
router.get('/:id/variants', validateProductIdMiddleware, getProductVariants);

/**
 * @route   GET /api/products/:id/images
 * @desc    Lista immagini di un prodotto
 * @access  Public
 */
router.get('/:id/images', validateProductIdMiddleware, getProductImages);

/**
 * @route   GET /api/products/:id/categories
 * @desc    Lista categorie di un prodotto
 * @access  Public
 */
router.get('/:id/categories', validateProductIdMiddleware, getProductCategories);

/**
 * @route   GET /api/products/:id/translations
 * @desc    Lista traduzioni di un prodotto
 * @access  Public
 */
router.get('/:id/translations', validateProductIdMiddleware, getProductTranslations);

// ============================================================================
// ADMIN ROUTES - Product Management
// ============================================================================

/**
 * @route   POST /api/products
 * @desc    Crea un nuovo prodotto
 * @access  Private (Admin, Product Manager)
 */
router.post(
  '/',
  authenticateToken,
  authorize(['product:create', 'product:manage']),
  validateCreateProductMiddleware,
  createProduct
);

/**
 * @route   POST /api/products/simple
 * @desc    Crea un prodotto semplice (con variante default automatica)
 * @access  Private (Admin, Product Manager)
 */
router.post(
  '/simple',
  authenticateToken,
  authorize(['product:create', 'product:manage']),
  createSimpleProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Aggiorna un prodotto
 * @access  Private (Admin, Product Manager)
 */
router.put(
  '/:id',
  authenticateToken,
  authorize(['product:update', 'product:manage']),
  validateProductIdMiddleware,
  validateUpdateProductMiddleware,
  updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Elimina un prodotto
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorize(['product:delete', 'product:manage']),
  validateProductIdMiddleware,
  deleteProduct
);

/**
 * @route   POST /api/products/bulk-update
 * @desc    Aggiorna multipli prodotti
 * @access  Private (Admin, Product Manager)
 */
router.post(
  '/bulk-update',
  authenticateToken,
  authorize(['product:update', 'product:manage']),
  bulkUpdateProducts
);

/**
 * @route   POST /api/products/bulk-delete
 * @desc    Elimina multipli prodotti
 * @access  Private (Admin)
 */
router.post(
  '/bulk-delete',
  authenticateToken,
  authorize(['product:delete', 'product:manage']),
  bulkDeleteProducts
);

// ============================================================================
// PRODUCT VARIANTS
// ============================================================================

/**
 * @route   GET /api/products/:productId/variants/:id
 * @desc    Ottieni dettagli variante
 * @access  Public
 */
router.get(
  '/:productId/variants/:id',
  validateVariantIdMiddleware,
  getVariantById
);

/**
 * @route   POST /api/products/:id/variants
 * @desc    Crea una nuova variante
 * @access  Private (Admin, Product Manager)
 */
router.post(
  '/:id/variants',
  authenticateToken,
  authorize(['product:create', 'product:manage']),
  validateCreateVariantMiddleware,
  createVariant
);

/**
 * @route   PUT /api/products/:productId/variants/:id
 * @desc    Aggiorna una variante
 * @access  Private (Admin, Product Manager)
 */
router.put(
  '/:productId/variants/:id',
  authenticateToken,
  authorize(['product:update', 'product:manage']),
  validateVariantIdMiddleware,
  validateUpdateVariantMiddleware,
  updateVariant
);

/**
 * @route   DELETE /api/products/:productId/variants/:id
 * @desc    Elimina una variante
 * @access  Private (Admin)
 */
router.delete(
  '/:productId/variants/:id',
  authenticateToken,
  authorize(['product:delete', 'product:manage']),
  validateVariantIdMiddleware,
  deleteVariant
);

// ============================================================================
// PRODUCT TRANSLATIONS
// ============================================================================

/**
 * @route   POST /api/products/:id/translations
 * @desc    Crea una traduzione per un prodotto
 * @access  Private (Admin, Product Manager)
 */
router.post(
  '/:id/translations',
  authenticateToken,
  authorize(['product:create', 'product:manage']),
  validateCreateTranslationMiddleware,
  createTranslation
);

/**
 * @route   PUT /api/products/:id/translations/:languageId
 * @desc    Aggiorna una traduzione
 * @access  Private (Admin, Product Manager)
 */
router.put(
  '/:id/translations/:languageId',
  authenticateToken,
  authorize(['product:update', 'product:manage']),
  validateUpdateTranslationMiddleware,
  updateTranslation
);

/**
 * @route   DELETE /api/products/:id/translations/:languageId
 * @desc    Elimina una traduzione
 * @access  Private (Admin, Product Manager)
 */
router.delete(
  '/:id/translations/:languageId',
  authenticateToken,
  authorize(['product:delete', 'product:manage']),
  deleteTranslation
);

// ============================================================================
// PRODUCT IMAGES
// ============================================================================

/**
 * @route   POST /api/products/:id/images
 * @desc    Aggiungi un'immagine al prodotto
 * @access  Private (Admin, Product Manager)
 */
router.post(
  '/:id/images',
  authenticateToken,
  authorize(['product:create', 'product:manage']),
  validateCreateImageMiddleware,
  createImage
);

/**
 * @route   PUT /api/products/:productId/images/:id
 * @desc    Aggiorna un'immagine
 * @access  Private (Admin, Product Manager)
 */
router.put(
  '/:productId/images/:id',
  authenticateToken,
  authorize(['product:update', 'product:manage']),
  validateProductImageIdMiddleware,
  validateUpdateImageMiddleware,
  updateImage
);

/**
 * @route   DELETE /api/products/:productId/images/:id
 * @desc    Elimina un'immagine
 * @access  Private (Admin, Product Manager)
 */
router.delete(
  '/:productId/images/:id',
  authenticateToken,
  authorize(['product:delete', 'product:manage']),
  deleteImage
);

/**
 * @route   PATCH /api/products/:productId/images/:id/set-cover
 * @desc    Imposta un'immagine come cover
 * @access  Private (Admin, Product Manager)
 */
router.patch(
  '/:productId/images/:id/set-cover',
  authenticateToken,
  authorize(['product:update', 'product:manage']),
  setCoverImage
);

// ============================================================================
// PRODUCT CATEGORIES
// ============================================================================

/**
 * @route   POST /api/products/:id/categories
 * @desc    Associa una categoria al prodotto
 * @access  Private (Admin, Product Manager)
 */
router.post(
  '/:id/categories',
  authenticateToken,
  authorize(['product:update', 'product:manage']),
  validateCreateProductCategoryMiddleware,
  addCategory
);

/**
 * @route   DELETE /api/products/:productId/categories/:categoryId
 * @desc    Rimuovi categoria dal prodotto
 * @access  Private (Admin, Product Manager)
 */
router.delete(
  '/:productId/categories/:categoryId',
  authenticateToken,
  authorize(['product:update', 'product:manage']),
  removeCategory
);

/**
 * @route   PATCH /api/products/:productId/categories/:categoryId/position
 * @desc    Aggiorna posizione categoria
 * @access  Private (Admin, Product Manager)
 */
router.patch(
  '/:productId/categories/:categoryId/position',
  authenticateToken,
  authorize(['product:update', 'product:manage']),
  updateCategoryPosition
);

// ============================================================================
// MANUFACTURERS
// ============================================================================

/**
 * @route   GET /api/products/manufacturers
 * @desc    Lista tutti i produttori
 * @access  Public
 */
router.get('/manufacturers', getAllManufacturers);

/**
 * @route   GET /api/products/manufacturers/:id
 * @desc    Ottieni dettagli produttore
 * @access  Public
 */
router.get('/manufacturers/:id', validateManufacturerIdMiddleware, getManufacturerById);

/**
 * @route   POST /api/products/manufacturers
 * @desc    Crea un nuovo produttore
 * @access  Private (Admin, Product Manager)
 */
router.post(
  '/manufacturers',
  authenticateToken,
  authorize(['product:create', 'product:manage']),
  validateCreateManufacturerMiddleware,
  createManufacturer
);

/**
 * @route   PUT /api/products/manufacturers/:id
 * @desc    Aggiorna un produttore
 * @access  Private (Admin, Product Manager)
 */
router.put(
  '/manufacturers/:id',
  authenticateToken,
  authorize(['product:update', 'product:manage']),
  validateManufacturerIdMiddleware,
  validateUpdateManufacturerMiddleware,
  updateManufacturer
);

/**
 * @route   DELETE /api/products/manufacturers/:id
 * @desc    Elimina un produttore
 * @access  Private (Admin)
 */
router.delete(
  '/manufacturers/:id',
  authenticateToken,
  authorize(['product:delete', 'product:manage']),
  validateManufacturerIdMiddleware,
  deleteManufacturer
);

// ============================================================================
// EXPORT
// ============================================================================

export default router;