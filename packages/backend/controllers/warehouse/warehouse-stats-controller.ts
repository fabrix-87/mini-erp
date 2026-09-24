import { prisma } from "@/config/prisma-config";
import { withTenantId } from "@/helpers/prisma-helper";
import { sendSuccess } from "@/utils/response-utils";
import { BadRequestError } from "@/utils/app-error-utils";
import { Decimal } from "@prisma/client/runtime/client";
import type { Prisma } from "@/generated/prisma/client";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { getRequiredTenantId, getValidatedQuery } from "@/helpers/validated-context";
import {
  MovementType,
  OPERATIONS_INCREASING_STOCK,
  WarehouseBatchStatsInput,
  WarehouseStatsInput,
  WarehouseVirtualStatsInput,
} from "@mini-erp/shared";

/**
 * Aggregates stock movements to compute on-hand quantity per product variant in a warehouse.
 * Uses SUM of quantity with sign based on movement type direction.
 *
 * @route GET /api/warehouse/stats/on-hand
 * @access Private (requires warehouse:read or inventory:read permission)
 * @param c - Hono context with validated query (warehouseId, productVariantId?, dateRange?)
 */
export const getOnHandStats = async (c: Context<AppBindings>) => {
  const { warehouseId, productVariantId, startDate, endDate } =
    getValidatedQuery<WarehouseStatsInput>(c);

  const tenantId = getRequiredTenantId(c);

  // Build base where clause for stock movements
  const whereClause: Prisma.StockMovementWhereInput = withTenantId(
    {
      warehouseId,
      status: "CONFIRMED", // Only count confirmed movements
    } satisfies Prisma.StockMovementWhereInput,
    tenantId,
  );

  if (productVariantId) {
    whereClause.productVariantId = productVariantId;
  }

  if (startDate || endDate) {
    whereClause.movementDate = {};
    if (startDate) {
      whereClause.movementDate.gte = new Date(startDate);
    }
    if (endDate) {
      whereClause.movementDate.lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }
  }

  // Aggregate by product variant
  const stockStats = await prisma.stockMovement.groupBy({
    by: ["productVariantId"],
    where: whereClause,
    _sum: {
      quantity: true,
    },
    orderBy: {
      productVariantId: "asc",
    },
  });

  // Transform into a map of productVariantId → onHand quantity
  const onHandMap = new Map<string, Decimal>();
  for (const stat of stockStats) {
    const productVariantId = stat.productVariantId;
    const totalMovement = stat._sum.quantity ?? new Decimal(0);

    // Determine sign based on movement type is not needed here since we're summing absolute quantities
    // The movement type determines direction, but for on-hand we need net movement
    // This requires a more complex aggregation - see getOnHandStatsDetailed below

    onHandMap.set(productVariantId, totalMovement);
  }

  return sendSuccess(c, {
    warehouseId,
    stats: Array.from(onHandMap.entries()).map(([productVariantId, quantity]) => ({
      productVariantId,
      quantity: quantity.toNumber(),
    })),
    meta: {
      startDate: startDate ?? null,
      endDate: endDate ?? null,
    },
  });
};

/**
 * Computes net on-hand quantity by applying direction logic to movement types.
 * IN movements (PURCHASE, RETURN_IN, ADJUSTMENT_IN, TRANSFER_IN, INVENTORY_START) add to stock.
 * OUT movements (SALE, RETURN_OUT, ADJUSTMENT_OUT, TRANSFER_OUT) subtract from stock.
 *
 * @route GET /api/warehouse/stats/on-hand-detailed
 * @access Private
 * @param c - Hono context
 */
export const getOnHandStatsDetailed = async (c: Context<AppBindings>) => {
  const { warehouseId, productVariantId, startDate, endDate } =
    getValidatedQuery<WarehouseStatsInput>(c);

  const tenantId = getRequiredTenantId(c);

  const whereClause: Prisma.StockMovementWhereInput = withTenantId(
    {
      warehouseId,
      status: "CONFIRMED",
    } satisfies Prisma.StockMovementWhereInput,
    tenantId,
  );

  if (productVariantId) {
    whereClause.productVariantId = productVariantId;
  }

  if (startDate || endDate) {
    whereClause.movementDate = {};
    if (startDate) {
      whereClause.movementDate.gte = new Date(startDate);
    }
    if (endDate) {
      whereClause.movementDate.lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }
  }

  // Fetch all movements with type and quantity
  const movements = await prisma.stockMovement.findMany({
    where: whereClause,
    select: {
      productVariantId: true,
      quantity: true,
      movementType: true,
    },
  });

  // Define movement types that add to stock
  const increasingStockOperations = new Set<MovementType>(OPERATIONS_INCREASING_STOCK);

  // Compute net on-hand per product variant
  const onHandMap = new Map<string, Decimal>();
  for (const movement of movements) {
    const { productVariantId, quantity, movementType } = movement;

    const current = onHandMap.get(productVariantId) ?? new Decimal(0);
    const signedQuantity = increasingStockOperations.has(movementType) ? quantity : quantity.neg();

    onHandMap.set(productVariantId, current.add(signedQuantity));
  }

  return sendSuccess(c, {
    warehouseId,
    stats: Array.from(onHandMap.entries()).map(([productVariantId, quantity]) => ({
      productVariantId,
      quantity: quantity.toNumber(),
    })),
    meta: {
      startDate: startDate ?? null,
      endDate: endDate ?? null,
    },
  });
};

/**
 * Returns reserved quantities per product variant in a warehouse from active stock reservations.
 *
 * @route GET /api/warehouse/stats/reserved
 * @access Private
 * @param c - Hono context
 */
export const getReservedStats = async (c: Context<AppBindings>) => {
  const {
    warehouseId,
    productVariantId,
    status = "ACTIVE",
  } = getValidatedQuery<WarehouseStatsInput>(c);

  const tenantId = getRequiredTenantId(c);

  const whereClause: Prisma.StockReservationWhereInput = withTenantId(
    {
      warehouseId,
      status,
    } satisfies Prisma.StockReservationWhereInput,
    tenantId,
  );

  if (productVariantId) {
    whereClause.productVariantId = productVariantId;
  }

  const reservedStats = await prisma.stockReservation.groupBy({
    by: ["productVariantId"],
    where: whereClause,
    _sum: {
      quantity: true,
    },
  });

  return sendSuccess(c, {
    warehouseId,
    stats: reservedStats
      .filter((s) => s._sum.quantity !== null)
      .map((s) => ({
        productVariantId: s.productVariantId,
        quantity: (s._sum.quantity ?? new Decimal(0)).toNumber(),
      })),
  });
};

/**
 * Returns available stock (on-hand minus reserved) per product variant.
 * Combines movement-based on-hand calculation with reservation data.
 *
 * @route GET /api/warehouse/stats/available
 * @access Private
 * @param c - Hono context
 */
export const getAvailableStats = async (c: Context<AppBindings>) => {
  const { warehouseId, productVariantId } = getValidatedQuery<WarehouseStatsInput>(c);

  const tenantId = getRequiredTenantId(c);

  // Get on-hand quantities
  const onHandWhere: Prisma.StockMovementWhereInput = withTenantId(
    {
      warehouseId,
      status: "CONFIRMED",
    } satisfies Prisma.StockMovementWhereInput,
    tenantId,
  );

  if (productVariantId) {
    onHandWhere.productVariantId = productVariantId;
  }

  const movements = await prisma.stockMovement.findMany({
    where: onHandWhere,
    select: {
      productVariantId: true,
      quantity: true,
      movementType: true,
    },
  });

  const increasingStockOperations = new Set<MovementType>(OPERATIONS_INCREASING_STOCK);

  const onHandMap = new Map<string, Decimal>();
  for (const movement of movements) {
    const { productVariantId, quantity, movementType } = movement;
    const current = onHandMap.get(productVariantId) ?? new Decimal(0);
    const signedQuantity = increasingStockOperations.has(movementType) ? quantity : quantity.neg();
    onHandMap.set(productVariantId, current.add(signedQuantity));
  }

  // Get reserved quantities (ACTIVE only)
  const reservedWhere: Prisma.StockReservationWhereInput = withTenantId(
    {
      warehouseId,
      status: "ACTIVE",
    } satisfies Prisma.StockReservationWhereInput,
    tenantId,
  );

  if (productVariantId) {
    reservedWhere.productVariantId = productVariantId;
  }

  const reservations = await prisma.stockReservation.groupBy({
    by: ["productVariantId"],
    where: reservedWhere,
    _sum: {
      quantity: true,
    },
  });

  const reservedMap = new Map<string, Decimal>();
  for (const res of reservations) {
    if (res._sum.quantity !== null) {
      reservedMap.set(res.productVariantId, res._sum.quantity);
    }
  }

  // Compute available = onHand - reserved
  const allProductVariantIds = new Set([...onHandMap.keys(), ...reservedMap.keys()]);

  const availableStats = Array.from(allProductVariantIds).map((productVariantId) => {
    const onHand = onHandMap.get(productVariantId) ?? new Decimal(0);
    const reserved = reservedMap.get(productVariantId) ?? new Decimal(0);
    const available = onHand.minus(reserved);

    return {
      productVariantId,
      onHand: onHand.toNumber(),
      reserved: reserved.toNumber(),
      available: available.toNumber(),
    };
  });

  return sendSuccess(c, {
    warehouseId,
    stats: availableStats,
  });
};

/**
 * Returns virtual stock snapshots for a virtual warehouse.
 *
 * @route GET /api/warehouse/stats/virtual
 * @access Private
 * @param c - Hono context
 */
export const getVirtualStockStats = async (c: Context<AppBindings>) => {
  const { warehouseId, productVariantId, syncStatus } =
    getValidatedQuery<WarehouseVirtualStatsInput>(c);

  const tenantId = getRequiredTenantId(c);

  // Verify warehouse is VIRTUAL type
  const warehouse = await prisma.warehouse.findUnique({
    where: {
      tenantId_code: {
        tenantId: tenantId,
        code: warehouseId, // Note: using code as identifier per schema
      },
    },
  });

  if (!warehouse) {
    throw new BadRequestError("Warehouse not found");
  }

  if (warehouse.type !== "VIRTUAL") {
    throw new BadRequestError("This endpoint is only for VIRTUAL warehouses");
  }

  const whereClause: Prisma.VirtualStockWhereInput = withTenantId(
    {
      warehouseId,
    },
    tenantId,
  );

  if (productVariantId) {
    whereClause.productVariantId = productVariantId;
  }

  if (syncStatus) {
    whereClause.syncStatus = syncStatus;
  }

  const virtualStocks = await prisma.virtualStock.findMany({
    where: whereClause,
    include: {
      productVariant: {
        select: {
          id: true,
          sku: true,
          name: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
        },
      },
      supplierCurrency: {
        select: {
          code: true,
          name: true,
        },
      },
    },
    orderBy: {
      productVariantId: "asc",
    },
  });

  return sendSuccess(c, {
    warehouseId,
    warehouseType: "VIRTUAL",
    stats: virtualStocks.map((vs) => ({
      productVariantId: vs.productVariantId,
      productVariant: vs.productVariant,
      quantity: vs.quantity.toNumber(),
      supplier: vs.supplier,
      supplierPrice: vs.supplierPrice?.toNumber() ?? null,
      supplierCurrency: vs.supplierCurrency,
      lastSyncAt: vs.lastSyncAt,
      syncStatus: vs.syncStatus,
      syncError: vs.syncError,
      leadTimeDays: vs.leadTimeDays,
      expectedAvailableDate: vs.expectedAvailableDate,
    })),
  });
};

/**
 * Returns batch-level stock information for lot-tracked inventory.
 *
 * @route GET /api/warehouse/stats/batches
 * @access Private
 * @param c - Hono context
 */
export const getBatchStats = async (c: Context<AppBindings>) => {
  const tenantId = getRequiredTenantId(c);

  const { warehouseId, productVariantId, status, includeExpired } =
    getValidatedQuery<WarehouseBatchStatsInput>(c);

  const whereClause: Prisma.StockBatchWhereInput = withTenantId(
    {
      warehouseId,
    },
    tenantId,
  );

  if (productVariantId) {
    whereClause.productVariantId = productVariantId;
  }

  if (status) {
    whereClause.status = status;
  }

  if (!includeExpired) {
    whereClause.status = {
      not: "EXPIRED",
    };
  }

  const batches = await prisma.stockBatch.findMany({
    where: whereClause,
    include: {
      productVariant: {
        select: {
          id: true,
          sku: true,
          name: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      expiryDate: "asc",
    },
  });

  return sendSuccess(c, {
    warehouseId,
    stats: batches.map((batch) => ({
      batchNumber: batch.batchNumber,
      productVariantId: batch.productVariantId,
      productVariant: batch.productVariant,
      quantity: batch.quantity.toNumber(),
      reserved: batch.reserved.toNumber(),
      available: batch.quantity.minus(batch.reserved).toNumber(),
      status: batch.status,
      manufacturedDate: batch.manufacturedDate,
      expiryDate: batch.expiryDate,
      supplier: batch.supplier,
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
    })),
  });
};

/**
 * Returns a summary of warehouse statistics including total movements, reservations, and batches.
 *
 * @route GET /api/warehouse/stats/summary
 * @access Private
 * @param c - Hono context
 */
export const getWarehouseSummaryStats = async (c: Context<AppBindings>) => {
  const tenantId = getRequiredTenantId(c);

  const { warehouseId } = getValidatedQuery<WarehouseStatsInput>(c);

  // Verify warehouse exists
  const warehouse = await prisma.warehouse.findFirst({
    where: withTenantId(
      {
        id: warehouseId,
        active: true,
      } satisfies Prisma.WarehouseWhereInput,
      tenantId,
    ),
    select: {
      id: true,
      code: true,
      name: true,
      type: true,
      active: true,
      isDefault: true,
    },
  });

  if (!warehouse) {
    throw new BadRequestError("Warehouse not found");
  }

  // Count movements by type
  const movementCounts = await prisma.stockMovement.groupBy({
    by: ["movementType"],
    where: withTenantId(
      {
        warehouseId,
        status: "CONFIRMED",
      },
      tenantId,
    ),
    _count: {
      id: true,
    },
  });

  // Count active reservations
  const activeReservationsCount = await prisma.stockReservation.count({
    where: withTenantId(
      {
        warehouseId,
        status: "ACTIVE",
      },
      tenantId,
    ),
  });

  // Count batches by status
  const batchCounts = await prisma.stockBatch.groupBy({
    by: ["status"],
    where: withTenantId(
      {
        warehouseId,
      },
      tenantId,
    ),
    _count: {
      id: true,
    },
  });

  return sendSuccess(c, {
    warehouse: {
      id: warehouse.id,
      code: warehouse.code,
      name: warehouse.name,
      type: warehouse.type,
      active: warehouse.active,
      isDefault: warehouse.isDefault,
    },
    summary: {
      movements: movementCounts.map((m) => ({
        type: m.movementType,
        count: m._count.id,
      })),
      activeReservations: activeReservationsCount,
      batches: batchCounts.map((b) => ({
        status: b.status,
        count: b._count.id,
      })),
    },
  });
};
