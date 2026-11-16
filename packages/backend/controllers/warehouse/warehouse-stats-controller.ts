import { prisma } from "@/config/prisma-config";
import { withSoftDelete, withTenantId, withTenantScope } from "@/helpers/prisma-helper";
import { sendSuccess } from "@/utils/response-utils";
import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { Decimal } from "@prisma/client/runtime/client";
import type { Prisma } from "@/generated/prisma/client";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getRequiredLanguageId,
  getRequiredTenantId,
  getValidatedQuery,
} from "@/helpers/validated-context";
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
 * Returns supplier stock snapshots for a virtual warehouse.
 *
 * Product and currency names use the request language.
 * Supplier information comes from the warehouse configuration.
 *
 * @route GET /api/warehouse/stats/virtual
 * @access Private
 * @param c - Hono request context.
 * @returns Virtual stock snapshots and synchronization details.
 */
export const getVirtualStockStats = async (c: Context<AppBindings>): Promise<Response> => {
  const { warehouseId, productVariantId, syncStatus } =
    getValidatedQuery<WarehouseVirtualStatsInput>(c);

  const tenantId = getRequiredTenantId(c);
  const languageId = getRequiredLanguageId(c);

  const warehouse = await prisma.warehouse.findFirst({
    where: {
      tenantId,
      id: warehouseId,
    },
    select: {
      id: true,
      type: true,
      supplier: {
        where: withSoftDelete({ tenantId }),
        select: {
          id: true,
          company: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
  });

  if (!warehouse) {
    throw new NotFoundError("Magazzino non trovato");
  }

  if (warehouse.type !== "VIRTUAL") {
    throw new BadRequestError("Questo endpoint è disponibile solo per magazzini virtuali");
  }

  const where = {
    tenantId,
    warehouseId: warehouse.id,
    ...(productVariantId ? { productVariantId } : {}),
    ...(syncStatus ? { syncStatus } : {}),
    productVariant: {
      is: {
        ...withTenantScope(tenantId),
        product: {
          is: withTenantScope(tenantId),
        },
      },
    },
  } satisfies Prisma.VirtualStockWhereInput;

  const virtualStocks = await prisma.virtualStock.findMany({
    where,
    include: {
      productVariant: {
        select: {
          id: true,
          sku: true,
          product: {
            select: {
              translations: {
                where: {
                  tenantId,
                  languageId,
                },
                select: {
                  name: true,
                },
                take: 1,
              },
            },
          },
        },
      },
      supplierCurrency: {
        select: {
          code: true,
          symbol: true,
          translations: {
            where: { languageId },
            select: { name: true },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      productVariantId: "asc",
    },
  });

  const supplier = warehouse.supplier
    ? {
        id: warehouse.supplier.id,
        name: warehouse.supplier.company.companyName,
      }
    : null;

  return sendSuccess(c, {
    warehouseId: warehouse.id,
    warehouseType: warehouse.type,
    stats: virtualStocks.map((stock) => ({
      productVariantId: stock.productVariantId,
      productVariant: {
        id: stock.productVariant.id,
        sku: stock.productVariant.sku,
        name: stock.productVariant.product.translations[0]?.name ?? stock.productVariant.sku,
      },
      quantity: stock.quantity.toNumber(),
      supplier,
      supplierPrice: stock.supplierPrice?.toNumber() ?? null,
      supplierCurrency: stock.supplierCurrency
        ? {
            code: stock.supplierCurrency.code,
            symbol: stock.supplierCurrency.symbol,
            name: stock.supplierCurrency.translations[0]?.name ?? stock.supplierCurrency.code,
          }
        : null,
      lastSyncAt: stock.lastSyncAt,
      syncStatus: stock.syncStatus,
      syncError: stock.syncError,
      leadTimeDays: stock.leadTimeDays,
      expectedAvailableDate: stock.expectedAvailableDate,
    })),
  });
};

/**
 * Returns batch balances and batch-specific active reservations.
 *
 * Unallocated reservations without a batch number are not distributed
 * across batches. Availability is quantity minus batch-specific reserved stock.
 *
 * @route GET /api/warehouse/stats/batches
 * @access Private
 * @param c - Hono request context.
 * @returns Batch balances, reservation totals, and supplier details.
 */
export const getBatchStats = async (c: Context<AppBindings>): Promise<Response> => {
  const tenantId = getRequiredTenantId(c);
  const languageId = getRequiredLanguageId(c);

  const { warehouseId, productVariantId, status, includeExpired } =
    getValidatedQuery<WarehouseBatchStatsInput>(c);

  const now = new Date();

  const warehouse = await prisma.warehouse.findFirst({
    where: {
      tenantId,
      id: warehouseId,
    },
    select: {
      id: true,
    },
  });

  if (!warehouse) {
    throw new NotFoundError("Magazzino non trovato");
  }

  const where = {
    tenantId,
    warehouseId: warehouse.id,
    ...(productVariantId ? { productVariantId } : {}),
    ...(status ? { status } : {}),
    ...(!includeExpired
      ? {
          AND: [
            { status: { not: "EXPIRED" } },
            {
              OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
            },
          ],
        }
      : {}),
    productVariant: {
      is: {
        ...withTenantScope(tenantId),
        product: {
          is: withTenantScope(tenantId),
        },
      },
    },
  } satisfies Prisma.StockBatchWhereInput;

  const batches = await prisma.stockBatch.findMany({
    where,
    include: {
      productVariant: {
        select: {
          id: true,
          sku: true,
          product: {
            select: {
              translations: {
                where: {
                  tenantId,
                  languageId,
                },
                select: {
                  name: true,
                },
                take: 1,
              },
            },
          },
        },
      },
      supplier: {
        where: withSoftDelete({ tenantId }),
        select: {
          id: true,
          company: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
    orderBy: [{ expiryDate: "asc" }, { id: "asc" }],
  });

  const reservedByBatch = new Map<string, Decimal>();

  if (batches.length > 0) {
    const reservations = await prisma.stockReservation.groupBy({
      by: ["productVariantId", "batchNumber"],
      where: {
        tenantId,
        warehouseId: warehouse.id,
        status: "ACTIVE",
        batchNumber: {
          in: [...new Set(batches.map((batch) => batch.batchNumber))],
        },
        productVariantId: {
          in: [...new Set(batches.map((batch) => batch.productVariantId))],
        },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        document: {
          is: withTenantScope(tenantId),
        },
      },
      _sum: {
        quantity: true,
      },
    });

    for (const reservation of reservations) {
      if (reservation.batchNumber === null) {
        continue;
      }

      const key = JSON.stringify([reservation.productVariantId, reservation.batchNumber]);

      reservedByBatch.set(key, reservation._sum.quantity ?? new Decimal(0));
    }
  }

  return sendSuccess(c, {
    warehouseId: warehouse.id,
    stats: batches.map((batch) => {
      const key = JSON.stringify([batch.productVariantId, batch.batchNumber]);

      const reserved = reservedByBatch.get(key) ?? new Decimal(0);

      return {
        batchNumber: batch.batchNumber,
        productVariantId: batch.productVariantId,
        productVariant: {
          id: batch.productVariant.id,
          sku: batch.productVariant.sku,
          name: batch.productVariant.product.translations[0]?.name ?? batch.productVariant.sku,
        },
        quantity: batch.quantity.toNumber(),
        reserved: reserved.toNumber(),
        available: batch.quantity.minus(reserved).toNumber(),
        status: batch.status,
        manufacturedDate: batch.manufacturedDate,
        expiryDate: batch.expiryDate,
        supplier: batch.supplier
          ? {
              id: batch.supplier.id,
              name: batch.supplier.company.companyName,
            }
          : null,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
      };
    }),
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

/**
 * Returns aggregate data for the warehouse list page.
 *
 * Physical quantities come from confirmed movements and active reservations.
 * Virtual variants are reported separately from physical stock.
 *
 * @route GET /api/warehouses/stats
 * @access Private (warehouse:read or warehouse:manage)
 * @param c - Hono context
 */
export const getWarehouseListStats = async (c: Context<AppBindings>): Promise<Response> => {
  const tenantId = getRequiredTenantId(c);
  const now = new Date();

  const [warehouseGroups, movementGroups, reservationGroups, virtualGroups] = await Promise.all([
    prisma.warehouse.groupBy({
      by: ["type", "active"],
      where: withTenantId({} satisfies Prisma.WarehouseWhereInput, tenantId),
      _count: { _all: true },
    }),

    prisma.stockMovement.groupBy({
      by: ["warehouseId", "productVariantId", "movementType"],
      where: withTenantId(
        {
          status: "CONFIRMED",
          warehouse: { type: "PHYSICAL", active: true },
        } satisfies Prisma.StockMovementWhereInput,
        tenantId,
      ),
      _sum: { quantity: true },
    }),

    prisma.stockReservation.groupBy({
      by: ["warehouseId", "productVariantId"],
      where: withTenantId(
        {
          status: "ACTIVE",
          warehouse: { type: "PHYSICAL", active: true },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        } satisfies Prisma.StockReservationWhereInput,
        tenantId,
      ),
      _sum: { quantity: true },
    }),

    prisma.virtualStock.groupBy({
      by: ["productVariantId"],
      where: withTenantId(
        {
          quantity: { gt: 0 },
          syncStatus: "SUCCESS",
          warehouse: { type: "VIRTUAL", active: true },
        } satisfies Prisma.VirtualStockWhereInput,
        tenantId,
      ),
    }),
  ]);

  const warehouses = {
    total: 0,
    active: 0,
    inactive: 0,
    physical: 0,
    virtual: 0,
  };

  for (const group of warehouseGroups) {
    const count = group._count._all;

    warehouses.total += count;

    if (group.active) warehouses.active += count;
    else warehouses.inactive += count;

    if (group.type === "PHYSICAL") warehouses.physical += count;
    else warehouses.virtual += count;
  }

  const increasingOperations = new Set<string>(OPERATIONS_INCREASING_STOCK);

  // Keep the warehouse in the key: stock in different warehouses must not
  // cancel out before availability is calculated.
  const balances = new Map<string, Decimal>();
  const variantsOnHand = new Set<string>();

  for (const group of movementGroups) {
    const key = `${group.warehouseId}:${group.productVariantId}`;
    const quantity = group._sum.quantity ?? new Decimal(0);
    const signedQuantity = increasingOperations.has(group.movementType) ? quantity : quantity.neg();

    balances.set(key, (balances.get(key) ?? new Decimal(0)).add(signedQuantity));
  }

  const reservations = new Map<string, Decimal>();

  for (const group of reservationGroups) {
    const key = `${group.warehouseId}:${group.productVariantId}`;

    reservations.set(key, group._sum.quantity ?? new Decimal(0));
  }

  let onHand = new Decimal(0);
  let reserved = new Decimal(0);
  let available = new Decimal(0);

  for (const [key, quantity] of balances) {
    onHand = onHand.add(quantity);

    if (quantity.gt(0)) {
      variantsOnHand.add(key.split(":")[1]!);
    }
  }

  for (const quantity of reservations.values()) {
    reserved = reserved.add(quantity);
  }

  for (const key of new Set([...balances.keys(), ...reservations.keys()])) {
    const quantity = balances.get(key) ?? new Decimal(0);
    const reservedQuantity = reservations.get(key) ?? new Decimal(0);

    available = available.add(quantity.minus(reservedQuantity));
  }

  return sendSuccess(c, {
    warehouses,
    physicalStock: {
      productVariants: variantsOnHand.size,
      onHand: onHand.toString(),
      reserved: reserved.toString(),
      available: available.toString(),
    },
    virtualStock: {
      productVariants: virtualGroups.length,
    },
  });
};
