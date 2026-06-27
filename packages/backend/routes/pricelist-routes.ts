import { createHonoApp } from "@/lib/hono-app";
import { authorize } from "../middleware/auth-middleware";
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
} from "../validators/pricelist-validator";
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
} from "../controllers/pricelist-controller";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const pricelistRoutes = createHonoApp();

// ============================================================================
// PRICE LIST ROUTES
// ============================================================================

/**
 * @route   POST /api/price-lists/calculate-price
 * @desc    Calcola prezzo per variant considerando gerarchia listini
 * @access  Private (pricelist:read)
 * @body    priceListId, variantId, quantity
 */
pricelistRoutes.post(
  "/calculate-price",
  requireTenantScope,
  authorize(["pricelist:read", "pricelist:manage"]),
  validateCalculatePrice,
  calculatePrice,
);

/**
 * @route   GET /api/price-lists
 * @desc    Ottieni tutti i Price Lists
 * @access  Private (pricelist:read)
 * @query   active, type, currency, validAt, sortBy, sortOrder
 */
pricelistRoutes.get(
  "/",
  requireTenantScope,
  authorize(["pricelist:read", "pricelist:manage"]),
  validatePriceListQuery,
  getAllPriceLists,
);

/**
 * @route   GET /api/price-lists/:id
 * @desc    Ottieni dettagli di un Price List specifico
 * @access  Private (pricelist:read)
 */
pricelistRoutes.get(
  "/:id",
  requireTenantScope,
  authorize(["pricelist:read", "pricelist:manage"]),
  validatePriceListId,
  getPriceListById,
);

/**
 * @route   POST /api/price-lists
 * @desc    Crea nuovo Price List
 * @access  Private (pricelist:create)
 */
pricelistRoutes.post(
  "/",
  requireTenantScope,
  authorize(["pricelist:create", "pricelist:manage"]),
  validateCreatePriceList,
  createPriceList,
);

/**
 * @route   PUT /api/price-lists/:id
 * @desc    Aggiorna Price List esistente
 * @access  Private (pricelist:update)
 */
pricelistRoutes.put(
  "/:id",
  requireTenantScope,
  authorize(["pricelist:update", "pricelist:manage"]),
  validateUpdatePriceList,
  updatePriceList,
);

/**
 * @route   DELETE /api/price-lists/:id
 * @desc    Elimina un Price List
 * @access  Private (pricelist:delete)
 */
pricelistRoutes.delete(
  "/:id",
  requireTenantScope,
  authorize(["pricelist:delete", "pricelist:manage"]),
  validatePriceListId,
  deletePriceList,
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
pricelistRoutes.get(
  "/:priceListId/items",
  requireTenantScope,
  authorize(["pricelist:read", "pricelist:manage"]),
  validatePriceListId,
  validatePriceListItemQuery,
  getPriceListItems,
);

/**
 * @route   POST /api/price-lists/:priceListId/items/bulk
 * @desc    Import bulk di items in un Price List
 * @access  Private (pricelist:create)
 * @body    items: [{ variantId, minQuantity, price, discountPercent }]
 */
pricelistRoutes.post(
  "/:priceListId/items/bulk",
  requireTenantScope,
  authorize(["pricelist:create", "pricelist:manage"]),
  validateBulkPriceListId,
  validateBulkImportItems,
  bulkImportItems,
);

/**
 * @route   POST /api/price-lists/items
 * @desc    Crea nuovo Price List Item
 * @access  Private (pricelist:create)
 */
pricelistRoutes.post(
  "/items",
  requireTenantScope,
  authorize(["pricelist:create", "pricelist:manage"]),
  validateCreatePriceListItem,
  createPriceListItem,
);

/**
 * @route   PUT /api/price-lists/items/:id
 * @desc    Aggiorna Price List Item esistente
 * @access  Private (pricelist:update)
 */
pricelistRoutes.put(
  "/items/:id",
  requireTenantScope,
  authorize(["pricelist:update", "pricelist:manage"]),
  validateUpdatePriceListItem,
  updatePriceListItem,
);

/**
 * @route   DELETE /api/price-lists/items/:id
 * @desc    Elimina un Price List Item
 * @access  Private (pricelist:delete)
 */
pricelistRoutes.delete(
  "/items/:id",
  requireTenantScope,
  authorize(["pricelist:delete", "pricelist:manage"]),
  validatePriceListItemId,
  deletePriceListItem,
);

// ============================================================================
// EXPORT
// ============================================================================

export default pricelistRoutes;
