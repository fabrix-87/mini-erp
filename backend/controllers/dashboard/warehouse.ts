import { Request, Response, NextFunction } from 'express';
import { getDateRangeFromPeriod, toNumber } from '../../helpers/dashboard';
import { prisma } from '../../config/prisma-client';

// ============================================================================
// WAREHOUSE DASHBOARD CONTROLLER
// ============================================================================

/**
 * @desc    Statistiche magazzino
 * @route   GET /api/dashboard/warehouse
 * @access  Private (dashboard:read)
 * @query   period, startDate, endDate, warehouseId
 */
export const getWarehouseStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      period, 
      startDate, 
      endDate,
      warehouseId 
    } = req.query;

    // Calculate date range
    const range = startDate && endDate
      ? { startDate: new Date(startDate as string), endDate: new Date(endDate as string) }
      : getDateRangeFromPeriod(period as string);

    // Build warehouse where clause
    const warehouseWhere: any = {};
    if (warehouseId) warehouseWhere.id = warehouseId as unknown as number;

    // Parallel queries
    const [
      warehouses,
      stockValueByWarehouse,
      movementsByType,
      recentMovements,
      stockDistribution,
    ] = await Promise.all([
      // 1. All warehouses summary
      prisma.warehouse.findMany({
        where: warehouseWhere,
        select: {
          id: true,
          name: true,
          type: true,
          location: true,
          _count: {
            select: {
              stockMovements: {
                where: {
                  movementDate: {
                    gte: range.startDate,
                    lte: range.endDate,
                  },
                },
              },
              virtualStocks: true,
            },
          },
        },
      }),

      // 2. Stock value by warehouse (physical only)
      prisma.$queryRaw<any[]>`
        SELECT 
          w.id,
          w.name,
          SUM(pv.quantity * COALESCE(CAST(pv.price AS DECIMAL), 0)) as stock_value,
          SUM(pv.quantity) as total_units
        FROM "Warehouse" w
        LEFT JOIN "StockMovement" sm ON w.id = sm."warehouseId"
        LEFT JOIN "ProductVariant" pv ON sm."productVariantId" = pv.id
        WHERE w.type = 'PHYSICAL'
        GROUP BY w.id, w.name
      `,

      // 3. Movements by type in period
      prisma.stockMovement.groupBy({
        by: ['movementType'],
        where: {
          movementDate: {
            gte: range.startDate,
            lte: range.endDate,
          },
          ...(warehouseId && { warehouseId: warehouseId as unknown as number }),
        },
        _sum: { quantity: true },
        _count: { id: true },
      }),

      // 4. Recent movements (last 20)
      prisma.stockMovement.findMany({
        where: {
          movementDate: {
            gte: range.startDate,
            lte: range.endDate,
          },
          ...(warehouseId && { warehouseId: warehouseId as unknown as number }),
        },
        select: {
          id: true,
          movementType: true,
          quantity: true,
          movementDate: true,
          note: true,
          warehouse: {
            select: {
              id: true,
              name: true,
            },
          },
          productVariant: {
            select: {
              id: true,
              variantCode: true,
              product: {
                select: {
                  reference: true,
                  translations: {
                    where: { languageId: 1 },
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          movementDate: 'desc',
        },
        take: 20,
      }),

      // 5. Stock distribution by category
      prisma.$queryRaw<any[]>`
        SELECT 
          c.id,
          SUM(pv.quantity) as total_quantity,
          COUNT(DISTINCT pv.id) as variant_count
        FROM "Category" c
        LEFT JOIN "ProductCategory" pc ON c.id = pc."categoryId"
        LEFT JOIN "Product" p ON pc."productId" = p.id
        LEFT JOIN "ProductVariant" pv ON p.id = pv."productId"
        WHERE pv.active = true
        GROUP BY c.id
        ORDER BY total_quantity DESC
        LIMIT 10
      `,
    ]);

    // Calculate inventory turnover (simplified)
    // Turnover = Cost of Goods Sold / Average Inventory Value
    const soldUnits = movementsByType
      .filter((m) => m.movementType === 'SALE')
      .reduce((sum, m) => sum + toNumber(m._sum.quantity || 0), 0);

    const totalStockValue = stockValueByWarehouse.reduce(
      (sum, w: any) => sum + parseFloat(w.stock_value || '0'),
      0
    );

    const avgUnitCost = totalStockValue / (stockValueByWarehouse.reduce(
      (sum, w: any) => sum + parseInt(w.total_units || '0'),
      0
    ) || 1);

    const inventoryTurnover = totalStockValue > 0
      ? (soldUnits * avgUnitCost) / totalStockValue
      : 0;

    // Enrich warehouses with stock values
    const enrichedWarehouses = warehouses.map((warehouse) => {
      const stockInfo = stockValueByWarehouse.find(
        (sv: any) => sv.id === warehouse.id
      );

      return {
        warehouseId: warehouse.id,
        name: warehouse.name,
        type: warehouse.type,
        location: warehouse.location,
        totalUnits: stockInfo ? parseInt(stockInfo.total_units || '0') : 0,
        stockValue: stockInfo ? parseFloat(stockInfo.stock_value || '0') : 0,
        movementsCount: warehouse._count.stockMovements,
        virtualStocksCount: warehouse._count.virtualStocks,
      };
    });

    // Enrich stock distribution
    const enrichedStockDistribution = await Promise.all(
      stockDistribution.slice(0, 10).map(async (item: any) => {
        const category = await prisma.category.findUnique({
          where: { id: item.id },
          select: {
            id: true,
            translations: {
              where: { languageId: 1 },
              select: { name: true },
            },
          },
        });

        return {
          categoryId: item.id,
          categoryName: category?.translations[0]?.name || 'Unknown',
          totalQuantity: parseInt(item.total_quantity || '0'),
          variantCount: parseInt(item.variant_count || '0'),
        };
      })
    );

    // Format movements by type
    const formattedMovementsByType = movementsByType.map((m) => ({
      type: m.movementType,
      quantity: toNumber(m._sum.quantity || 0),
      count: m._count.id,
    }));

    // Calculate in/out totals
    const inboundTypes = ['PURCHASE', 'RETURN_IN', 'ADJUSTMENT', 'TRANSFER_IN', 'INVENTORY_START'];
    const outboundTypes = ['SALE', 'RETURN_OUT', 'TRANSFER_OUT'];

    const totalInbound = movementsByType
      .filter((m) => inboundTypes.includes(m.movementType))
      .reduce((sum, m) => sum + Math.abs(toNumber(m._sum.quantity || 0)), 0);

    const totalOutbound = movementsByType
      .filter((m) => outboundTypes.includes(m.movementType))
      .reduce((sum, m) => sum + Math.abs(toNumber(m._sum.quantity || 0)), 0);

    // Format recent movements
    const formattedRecentMovements = recentMovements.map((m) => ({
      movementId: m.id,
      type: m.movementType,
      quantity: m.quantity,
      date: m.movementDate,
      warehouse: m.warehouse.name,
      variantCode: m.productVariant.variantCode,
      productReference: m.productVariant.product.reference,
      productName: m.productVariant.product.translations[0]?.name || 'Unknown',
      note: m.note,
    }));

    res.status(200).json({
      success: true,
      data: {
        period: range,
        summary: {
          totalWarehouses: warehouses.length,
          totalStockValue,
          totalInbound,
          totalOutbound,
          netMovement: totalInbound - totalOutbound,
          inventoryTurnover: inventoryTurnover.toFixed(2),
        },
        warehouses: enrichedWarehouses,
        movementsByType: formattedMovementsByType,
        recentMovements: formattedRecentMovements,
        stockDistribution: enrichedStockDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};