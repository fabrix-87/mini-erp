import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import {
  validateCreatePriceList,
  validateUpdatePriceList,
  validateCreatePriceListItem,
  validateUpdatePriceListItem,
  validateBulkImportItems,
  validateCalculatePrice,
  validatePriceListId,
  validatePriceListItemId,
  validatePriceListQuery,
  validatePriceListItemQuery,
  validateBulkPriceListId,
} from '../validators/pricelist';
import {
  getAllPriceLists,
  getPriceListById,
  createPriceList,
  updatePriceList,
  deletePriceList,
  getPriceListItems,
  createPriceListItem,
  updatePriceListItem,
  deletePriceListItem,
  bulkImportItems,
  calculatePrice,
} from '../controllers/pricelist';

const router = express.Router();

// ============================================================================
// PRICE LIST ROUTES
// ============================================================================

/**
 * @route   POST /api/price-lists/calculate-price
 * @desc    Calcola prezzo per variant considerando gerarchia listini
 * @access  Private (pricelist:read)
 * @body    priceListId, variantId, quantity
 */
router.post(
  '/calculate-price',
  authenticateToken,
  authorize(['pricelist:read', 'pricelist:manage']),
  validateCalculatePrice,
  calculatePrice
);

/**
 * @route   GET /api/price-lists
 * @desc    Ottieni tutti i Price Lists
 * @access  Private (pricelist:read)
 * @query   active, type, currency, validAt, sortBy, sortOrder
 */
router.get(
  '/',
  authenticateToken,
  authorize(['pricelist:read', 'pricelist:manage']),
  validatePriceListQuery,
  getAllPriceLists
);

/**
 * @route   GET /api/price-lists/:id
 * @desc    Ottieni dettagli di un Price List specifico
 * @access  Private (pricelist:read)
 */
router.get(
  '/:id',
  authenticateToken,
  authorize(['pricelist:read', 'pricelist:manage']),
  validatePriceListId,
  getPriceListById
);

/**
 * @route   POST /api/price-lists
 * @desc    Crea nuovo Price List
 * @access  Private (pricelist:create)
 */
router.post(
  '/',
  authenticateToken,
  authorize(['pricelist:create', 'pricelist:manage']),
  validateCreatePriceList,
  createPriceList
);

/**
 * @route   PUT /api/price-lists/:id
 * @desc    Aggiorna Price List esistente
 * @access  Private (pricelist:update)
 */
router.put(
  '/:id',
  authenticateToken,
  authorize(['pricelist:update', 'pricelist:manage']),
  validateUpdatePriceList,
  updatePriceList
);

/**
 * @route   DELETE /api/price-lists/:id
 * @desc    Elimina un Price List
 * @access  Private (pricelist:delete)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorize(['pricelist:delete', 'pricelist:manage']),
  validatePriceListId,
  deletePriceList
);

// ============================================================================
// PRICE LIST ITEM ROUTES
// ============================================================================

/**
 * @route   GET /api/price-lists/:priceListId/items
 * @desc    Ottieni tutti gli items di un Price List
 * @access  Private (pricelist:read)
 * @query   variantId, minPrice, maxPrice
 */
router.get(
  '/:priceListId/items',
  authenticateToken,
  authorize(['pricelist:read', 'pricelist:manage']),
  validatePriceListId,
  validatePriceListItemQuery,
  getPriceListItems
);

/**
 * @route   POST /api/price-lists/:priceListId/items/bulk
 * @desc    Import bulk di items in un Price List
 * @access  Private (pricelist:create)
 * @body    items: [{ variantId, minQuantity, price, discountPercent }]
 */
router.post(
  '/:priceListId/items/bulk',
  authenticateToken,
  authorize(['pricelist:create', 'pricelist:manage']),
  validateBulkPriceListId,
  validateBulkImportItems,
  bulkImportItems
);

/**
 * @route   POST /api/price-lists/items
 * @desc    Crea nuovo Price List Item
 * @access  Private (pricelist:create)
 */
router.post(
  '/items',
  authenticateToken,
  authorize(['pricelist:create', 'pricelist:manage']),
  validateCreatePriceListItem,
  createPriceListItem
);

/**
 * @route   PUT /api/price-lists/items/:id
 * @desc    Aggiorna Price List Item esistente
 * @access  Private (pricelist:update)
 */
router.put(
  '/items/:id',
  authenticateToken,
  authorize(['pricelist:update', 'pricelist:manage']),
  validateUpdatePriceListItem,
  updatePriceListItem
);

/**
 * @route   DELETE /api/price-lists/items/:id
 * @desc    Elimina un Price List Item
 * @access  Private (pricelist:delete)
 */
router.delete(
  '/items/:id',
  authenticateToken,
  authorize(['pricelist:delete', 'pricelist:manage']),
  validatePriceListItemId,
  deletePriceListItem
);

// ============================================================================
// EXPORT
// ============================================================================

export default router;