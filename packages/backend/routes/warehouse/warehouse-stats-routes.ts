import { createHonoApp } from "@/lib/hono-app";
import {
  getOnHandStats,
  getOnHandStatsDetailed,
  getReservedStats,
  getAvailableStats,
  getVirtualStockStats,
  getBatchStats,
  getWarehouseSummaryStats,
} from "@/controllers/warehouse/warehouse-stats-controller";
import {
  validateWarehouseStatsQuery,
  validateBatchStatsQuery,
  validateVirtualStatsQuery,
} from "@/validators/warehouse-validator";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";
import { authorize } from "@/middleware/auth-middleware";

const warehouseStatsRoutes = createHonoApp();

/**
 * @route   GET /api/warehouse/stats/on-hand
 * @desc    Ottieni quantità on-hand per variante prodotto
 * @access  Private (warehouse:read)
 * @query   warehouseId, productVariantId?, startDate?, endDate?
 */
warehouseStatsRoutes.get(
  "/on-hand",
  requireTenantScope,
  authorize(["warehouse:read", "warehouse:manage"]),
  validateWarehouseStatsQuery,
  getOnHandStats,
);

/**
 * @route   GET /api/warehouse/stats/on-hand-detailed
 * @desc    Ottieni quantità on-hand con logica direzionale movimenti
 * @access  Private (warehouse:read)
 * @query   warehouseId, productVariantId?, startDate?, endDate?
 */
warehouseStatsRoutes.get(
  "/on-hand-detailed",
  requireTenantScope,
  authorize(["warehouse:read", "warehouse:manage"]),
  validateWarehouseStatsQuery,
  getOnHandStatsDetailed,
);

/**
 * @route   GET /api/warehouse/stats/reserved
 * @desc    Ottieni quantità riservate da prenotazioni attive
 * @access  Private (warehouse:read)
 * @query   warehouseId, productVariantId?, status?
 */
warehouseStatsRoutes.get(
  "/reserved",
  requireTenantScope,
  authorize(["warehouse:read", "warehouse:manage"]),
  validateWarehouseStatsQuery,
  getReservedStats,
);

/**
 * @route   GET /api/warehouse/stats/available
 * @desc    Ottieni stock disponibile (on-hand meno riservato)
 * @access  Private (warehouse:read)
 * @query   warehouseId, productVariantId?
 */
warehouseStatsRoutes.get(
  "/available",
  requireTenantScope,
  authorize(["warehouse:read", "warehouse:manage"]),
  validateWarehouseStatsQuery,
  getAvailableStats,
);

/**
 * @route   GET /api/warehouse/stats/virtual
 * @desc    Ottieni snapshot stock per warehouse virtuale
 * @access  Private (warehouse:read)
 * @query   warehouseId, productVariantId?, syncStatus?
 */
warehouseStatsRoutes.get(
  "/virtual",
  requireTenantScope,
  authorize(["warehouse:read", "warehouse:manage"]),
  validateVirtualStatsQuery,
  getVirtualStockStats,
);

/**
 * @route   GET /api/warehouse/stats/batches
 * @desc    Ottieni stock per lotti (lot tracking)
 * @access  Private (warehouse:read)
 * @query   warehouseId, productVariantId?, status?, includeExpired?
 */
warehouseStatsRoutes.get(
  "/batches",
  requireTenantScope,
  authorize(["warehouse:read", "warehouse:manage"]),
  validateBatchStatsQuery,
  getBatchStats,
);

/**
 * @route   GET /api/warehouse/stats/summary
 * @desc    Ottieni riepilogo statistiche warehouse
 * @access  Private (warehouse:read)
 * @query   warehouseId
 */
warehouseStatsRoutes.get(
  "/summary",
  requireTenantScope,
  authorize(["warehouse:read", "warehouse:manage"]),
  validateWarehouseStatsQuery,
  getWarehouseSummaryStats,
);

export default warehouseStatsRoutes;
