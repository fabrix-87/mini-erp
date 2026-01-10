// controllers/dashboard.supplier.controller.ts
import { Response, NextFunction } from "express";
import { prisma } from "../../config/prisma-client";
import { Prisma } from "../../generated/prisma/client";
import { AuthenticatedValidatedRequest } from '@/types/validate';

/**
 * @desc    Ottieni statistiche dashboard fornitori
 * @route   GET /api/dashboard/suppliers
 * @access  Private (dashboard:read)
 */
export const getSupplierStatistics = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Esegui query parallele per performance
    const [
      totalSuppliers,
      totalSpent,
      avgRating,
      suppliersByRating,
      topSuppliersBySpent,
      topSuppliersByOrders,
      recentOrders,
    ] = await Promise.all([
      // 1. Totale fornitori
      prisma.supplier.count(),

      // 2. Spesa totale
      prisma.supplier.aggregate({
        _sum: {
          totalSpent: true,
        },
      }),

      // 3. Rating medio
      prisma.supplier.aggregate({
        _avg: {
          rating: true,
        },
      }),

      // 4. Fornitori per rating
      prisma.supplier.groupBy({
        by: ["rating"],
        _count: {
          id: true,
        },
        orderBy: {
          rating: "desc",
        },
      }),

      // 5. Top 10 fornitori per spesa
      prisma.supplier.findMany({
        take: 10,
        orderBy: {
          totalSpent: "desc",
        },
        select: {
          id: true,
          totalSpent: true,
          totalOrders: true,
          rating: true,
          company: {
            select: {
              id: true,
              code: true,
              companyName: true,
              tradeName: true,
            },
          },
        },
      }),

      // 6. Top 10 fornitori per numero ordini
      prisma.supplier.findMany({
        take: 10,
        orderBy: {
          totalOrders: "desc",
        },
        select: {
          id: true,
          totalSpent: true,
          totalOrders: true,
          rating: true,
          company: {
            select: {
              id: true,
              code: true,
              companyName: true,
              tradeName: true,
            },
          },
        },
      }),

      // 7. Ultimi 10 ordini da fornitori
      prisma.document.findMany({
        where: {
          documentType: "SUPPLIER_ORDER",
        },
        take: 10,
        orderBy: {
          documentDate: "desc",
        },
        select: {
          id: true,
          documentNumber: true,
          documentType: true,
          documentDate: true,
          totalAmount: true,
          status: true,
          supplier: {
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
      }),
    ]);

    // Formatta rating distribution
    const byRating = suppliersByRating.reduce((acc, item) => {
      acc[item.rating || 0] = item._count.id;
      return acc;
    }, {} as Record<number, number>);

    // Assicura che tutti i rating da 1 a 5 siano presenti
    for (let i = 1; i <= 5; i++) {
      if (!byRating[i]) {
        byRating[i] = 0;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        total: totalSuppliers,
        totalSpent: parseFloat(totalSpent._sum.totalSpent?.toString() || "0"),
        avgRating: parseFloat(avgRating._avg.rating?.toString() || "0"),
        byRating,
        topSuppliersBySpent: topSuppliersBySpent.map((supplier) => ({
          id: supplier.id,
          companyId: supplier.company.id,
          companyName: supplier.company.companyName,
          tradeName: supplier.company.tradeName,
          code: supplier.company.code,
          totalSpent: parseFloat(supplier.totalSpent.toString()),
          totalOrders: supplier.totalOrders,
          rating: supplier.rating,
        })),
        topSuppliersByOrders: topSuppliersByOrders.map((supplier) => ({
          id: supplier.id,
          companyId: supplier.company.id,
          companyName: supplier.company.companyName,
          tradeName: supplier.company.tradeName,
          code: supplier.company.code,
          totalSpent: parseFloat(supplier.totalSpent.toString()),
          totalOrders: supplier.totalOrders,
          rating: supplier.rating,
        })),
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          documentNumber: order.documentNumber,
          documentType: order.documentType,
          documentDate: order.documentDate,
          totalAmount: parseFloat(order.totalAmount.toString()),
          status: order.status,
          supplierName: order.supplier?.company.companyName || "N/A",
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ottieni statistiche fornitori avanzate con filtri
 * @route   GET /api/dashboard/suppliers/advanced
 * @access  Private (dashboard:read)
 */
export const getSupplierAdvancedStatistics = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { minRating, dateFrom, dateTo } = req.query;

    // Build where clause
    const where: Prisma.SupplierWhereInput = {};

    if (minRating) {
      where.rating = {
        gte: parseInt(minRating as string),
      };
    }

    // Query parallele
    const [
      totalFiltered,
      avgLeadTime,
      totalTransportCost,
      suppliersByCountry,
      supplierPerformance,
    ] = await Promise.all([
      // 1. Totale fornitori filtrati
      prisma.supplier.count({ where }),

      // 2. Tempo medio di consegna
      prisma.supplier.aggregate({
        where,
        _avg: {
          leadTimeDays: true,
        },
      }),

      // 3. Costo trasporto totale
      prisma.supplier.aggregate({
        where,
        _sum: {
          transportCost: true,
        },
      }),

      // 4. Fornitori per paese
      prisma.supplier.findMany({
        where,
        select: {
          company: {
            select: {
              countryCode: true,
            },
          },
        },
      }),

      // 5. Performance fornitori (ordini + spesa media)
      prisma.supplier.findMany({
        where,
        select: {
          id: true,
          totalOrders: true,
          totalSpent: true,
          rating: true,
          leadTimeDays: true,
          company: {
            select: {
              companyName: true,
            },
          },
        },
      }),
    ]);

    // Raggruppa per paese
    const byCountry = suppliersByCountry.reduce((acc, item) => {
      const country = item.company.countryCode;
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcola spesa media per ordine
    const performance = supplierPerformance
      .map((supplier) => {
        const avgSpentPerOrder =
          supplier.totalOrders > 0
            ? parseFloat(supplier.totalSpent.toString()) / supplier.totalOrders
            : 0;

        return {
          id: supplier.id,
          companyName: supplier.company.companyName,
          totalOrders: supplier.totalOrders,
          totalSpent: parseFloat(supplier.totalSpent.toString()),
          avgSpentPerOrder: parseFloat(avgSpentPerOrder.toFixed(2)),
          rating: supplier.rating,
          leadTimeDays: supplier.leadTimeDays,
        };
      })
      .sort((a, b) => b.avgSpentPerOrder - a.avgSpentPerOrder)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        totalFiltered,
        avgLeadTimeDays: parseFloat(
          avgLeadTime._avg.leadTimeDays?.toString() || "0"
        ),
        totalTransportCost: parseFloat(
          totalTransportCost._sum.transportCost?.toString() || "0"
        ),
        byCountry,
        topPerformers: performance,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ottieni trend ordini fornitori
 * @route   GET /api/dashboard/suppliers/trends
 * @access  Private (dashboard:read)
 */
export const getSupplierOrderTrends = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { period = "last30days", groupBy = "day" } = req.query;

    // Calcola date range
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case "last7days":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "last30days":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "last90days":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "last12months":
        startDate.setMonth(endDate.getMonth() - 12);
        break;
      case "thisYear":
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Query ordini fornitori
    const orders = await prisma.document.findMany({
      where: {
        documentType: "SUPPLIER_ORDER",
        documentDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        documentDate: true,
        totalAmount: true,
        status: true,
      },
      orderBy: {
        documentDate: "asc",
      },
    });

    // Raggruppa per periodo
    const groupedData = orders.reduce((acc, order) => {
      let key: string;
      const date = new Date(order.documentDate);

      switch (groupBy) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          break;
        case "year":
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split("T")[0];
      }

      if (!acc[key]) {
        acc[key] = {
          period: key,
          totalAmount: 0,
          count: 0,
          byStatus: {} as Record<string, number>,
        };
      }

      acc[key].totalAmount += parseFloat(order.totalAmount.toString());
      acc[key].count += 1;
      acc[key].byStatus[order.status] =
        (acc[key].byStatus[order.status] || 0) + 1;

      return acc;
    }, {} as Record<string, any>);

    const trend = Object.values(groupedData).map((item: any) => ({
      period: item.period,
      totalAmount: parseFloat(item.totalAmount.toFixed(2)),
      count: item.count,
      avgAmount: parseFloat((item.totalAmount / item.count).toFixed(2)),
      byStatus: item.byStatus,
    }));

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate,
          endDate,
        },
        groupBy,
        trend,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confronta performance fornitori
 * @route   GET /api/dashboard/suppliers/compare
 * @access  Private (dashboard:read)
 */
export const compareSuppliers = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { supplierIds } = req.query;

    if (!supplierIds) {
      res.status(400).json({
        success: false,
        message: "supplierIds query parameter è obbligatorio",
      });
      return;
    }

    const ids = (supplierIds as string).split(",").map((id) => parseInt(id));

    const suppliers = await prisma.supplier.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        company: {
          select: {
            companyName: true,
            tradeName: true,
            countryCode: true,
          },
        },
      },
    });

    // Per ogni fornitore, ottieni statistiche dettagliate
    const comparisons = await Promise.all(
      suppliers.map(async (supplier) => {
        const [orderStats, avgOrderValue, onTimeDelivery] = await Promise.all([
          // Statistiche ordini
          prisma.document.aggregate({
            where: {
              supplierId: supplier.id,
              documentType: "SUPPLIER_ORDER",
            },
            _count: {
              id: true,
            },
            _sum: {
              totalAmount: true,
            },
          }),

          // Valore medio ordine
          prisma.document.aggregate({
            where: {
              supplierId: supplier.id,
              documentType: "SUPPLIER_ORDER",
            },
            _avg: {
              totalAmount: true,
            },
          }),

          // Ordini consegnati in tempo (status DELIVERED)
          prisma.document.count({
            where: {
              supplierId: supplier.id,
              documentType: "SUPPLIER_ORDER",
              status: "DELIVERED",
            },
          }),
        ]);

        const totalOrders = orderStats._count.id;
        const onTimeRate =
          totalOrders > 0 ? (onTimeDelivery / totalOrders) * 100 : 0;

        return {
          id: supplier.id,
          companyName: supplier.company.companyName,
          tradeName: supplier.company.tradeName,
          countryCode: supplier.company.countryCode,
          rating: supplier.rating,
          totalOrders,
          totalSpent: parseFloat(
            orderStats._sum.totalAmount?.toString() || "0"
          ),
          avgOrderValue: parseFloat(
            avgOrderValue._avg.totalAmount?.toString() || "0"
          ),
          leadTimeDays: supplier.leadTimeDays,
          onTimeDeliveryRate: parseFloat(onTimeRate.toFixed(2)),
          creditLimit: parseFloat(supplier.creditLimit?.toString() || "0"),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        suppliers: comparisons,
      },
    });
  } catch (error) {
    next(error);
  }
};
