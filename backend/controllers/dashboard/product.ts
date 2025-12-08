import { Request, Response, NextFunction } from 'express';
import { getDateRangeFromPeriod, toNumber } from '../../helpers/dashboard';
import { prisma } from '../../config/prisma-client';

// ============================================================================
// PRODUCT DASHBOARD CONTROLLER
// ============================================================================

/**
 * @desc    Statistiche prodotti
 * @route   GET /api/dashboard/products
 * @access  Private (dashboard:read)
 * @query   period, startDate, endDate, categoryId, manufacturerId
 */
export const getProductStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      period, 
      startDate, 
      endDate,
      categoryId,
      manufacturerId 
    } = req.query;

    // Calculate date range
    const range = startDate && endDate
      ? { startDate: new Date(startDate as string), endDate: new Date(endDate as string) }
      : getDateRangeFromPeriod(period as string);

    // Build product where clause
    const productWhere: any = {
      active: true,
    };
    if (categoryId) {
      productWhere.categories = {
        some: { categoryId: categoryId as unknown as number }
      };
    }
    if (manufacturerId) {
      productWhere.manufacturerId = manufacturerId as unknown as number;
    }

    // Parallel queries
    const [
      productSummary,
      lowStockProducts,
      bestSellers,
      categoryPerformance,
      stockValue,
    ] = await Promise.all([
      // 1. Product summary by status
      prisma.product.groupBy({
        by: ['active', 'availableForOrder', 'type'],
        _count: { id: true },
      }),

      // 2. Low stock alerts (variants below threshold)
      prisma.productVariant.findMany({
        where: {
          active: true,
          lowStockAlertEnabled: true,
          quantity: {
            lte: prisma.productVariant.fields.lowStockThreshold,
          },
          product: productWhere,
        },
        select: {
          id: true,
          variantCode: true,
          quantity: true,
          lowStockThreshold: true,
          product: {
            select: {
              id: true,
              reference: true,
              translations: {
                where: { languageId: 1 }, // Default language
                select: { name: true },
              },
            },
          },
        },
        orderBy: { quantity: 'asc' },
        take: 20,
      }),

      // 3. Best sellers (by document lines in period)
      prisma.documentLine.groupBy({
        by: ['productId'],
        where: {
          productId: { not: null },
          document: {
            documentDate: {
              gte: range.startDate,
              lte: range.endDate,
            },
            documentType: { in: ['ORDER', 'INVOICE'] },
            status: { notIn: ['VOIDED', 'REJECTED'] },
          },
        },
        _sum: {
          quantity: true,
          lineTotal: true,
        },
        _count: { id: true },
        orderBy: {
          _sum: { lineTotal: 'desc' },
        },
        take: 10,
      }),

      // 4. Category performance
      prisma.$queryRaw<any[]>`
        SELECT 
          c.id,
          COUNT(DISTINCT pc."productId") as product_count,
          SUM(CAST(dl."lineTotal" AS DECIMAL)) as total_revenue,
          COUNT(dl.id) as order_count
        FROM "Category" c
        LEFT JOIN "ProductCategory" pc ON c.id = pc."categoryId"
        LEFT JOIN "Product" p ON pc."productId" = p.id
        LEFT JOIN "DocumentLine" dl ON p.id = dl."productId"
        LEFT JOIN "Document" d ON dl."documentId" = d.id
        WHERE d."documentDate" >= ${range.startDate}
          AND d."documentDate" <= ${range.endDate}
          AND d."documentType" IN ('ORDER', 'INVOICE')
          AND d.status NOT IN ('VOIDED', 'REJECTED')
        GROUP BY c.id
        ORDER BY total_revenue DESC
        LIMIT 10
      `,

      // 5. Stock value (all active variants)
      prisma.productVariant.aggregate({
        where: {
          active: true,
          product: {
            active: true,
          },
        },
        _sum: {
          quantity: true,
        },
      }),
    ]);

    // Enrich best sellers with product details
    const enrichedBestSellers = await Promise.all(
      bestSellers.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId! },
          select: {
            id: true,
            reference: true,
            coverThumbnailUrl: true,
            translations: {
              where: { languageId: 1 },
              select: { name: true },
            },
          },
        });

        return {
          productId: item.productId,
          reference: product?.reference || 'N/A',
          name: product?.translations[0]?.name || 'Unknown',
          image: product?.coverThumbnailUrl,
          totalQuantity: toNumber(item._sum.quantity || 0),
          totalRevenue: toNumber(item._sum.lineTotal || 0),
          orderCount: item._count.id,
        };
      })
    );

    // Enrich category performance
    const enrichedCategories = await Promise.all(
      categoryPerformance.slice(0, 10).map(async (cat: any) => {
        const category = await prisma.category.findUnique({
          where: { id: cat.id },
          select: {
            id: true,
            translations: {
              where: { languageId: 1 },
              select: { name: true },
            },
          },
        });

        return {
          categoryId: cat.id,
          name: category?.translations[0]?.name || 'Unknown',
          productCount: parseInt(cat.product_count || '0'),
          totalRevenue: parseFloat(cat.total_revenue || '0'),
          orderCount: parseInt(cat.order_count || '0'),
        };
      })
    );

    // Calculate stock value (simplified - would need prices)
    const variants = await prisma.productVariant.findMany({
      where: {
        active: true,
        quantity: { gt: 0 },
      },
      select: {
        quantity: true,
        price: true,
        wholesalePrice: true,
      },
    });

    const totalStockValue = variants.reduce((sum, v) => {
      const price = toNumber(v.price || v.wholesalePrice || 0);
      return sum + (v.quantity * price);
    }, 0);

    // Format product summary
    const summary = {
      total: productSummary.reduce((sum, g) => sum + g._count.id, 0),
      active: productSummary
        .filter((g) => g.active)
        .reduce((sum, g) => sum + g._count.id, 0),
      inactive: productSummary
        .filter((g) => !g.active)
        .reduce((sum, g) => sum + g._count.id, 0),
      byType: productSummary.reduce((acc, g) => {
        acc[g.type] = (acc[g.type] || 0) + g._count.id;
        return acc;
      }, {} as Record<string, number>),
    };

    res.status(200).json({
      success: true,
      data: {
        period: range,
        summary,
        lowStockAlerts: lowStockProducts.map((v) => ({
          variantId: v.id,
          variantCode: v.variantCode,
          productReference: v.product.reference,
          productName: v.product.translations[0]?.name || 'Unknown',
          currentStock: v.quantity,
          threshold: v.lowStockThreshold,
          deficit: v.lowStockThreshold - v.quantity,
        })),
        bestSellers: enrichedBestSellers,
        categoryPerformance: enrichedCategories,
        stockValue: {
          totalUnits: toNumber(stockValue._sum.quantity || 0),
          estimatedValue: totalStockValue,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};