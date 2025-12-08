import { Request, Response, NextFunction } from 'express';
import { getDateRangeFromPeriod, toNumber } from '../../helpers/dashboard';
import { prisma } from '../../config/prisma-client';

// ============================================================================
// CUSTOMER DASHBOARD CONTROLLER
// ============================================================================

/**
 * @desc    Statistiche clienti
 * @route   GET /api/dashboard/customers
 * @access  Private (dashboard:read)
 * @query   period, startDate, endDate, segment, leadStatus
 */
export const getCustomerStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      period, 
      startDate, 
      endDate,
      segment,
      leadStatus 
    } = req.query;

    // Calculate date range
    const range = startDate && endDate
      ? { startDate: new Date(startDate as string), endDate: new Date(endDate as string) }
      : getDateRangeFromPeriod(period as string);

    // Build customer where clause
    const customerWhere: any = {};
    if (segment) customerWhere.segment = segment;
    if (leadStatus) customerWhere.leadStatus = leadStatus;

    // Parallel queries
    const [
      customersByType,
      customersBySegment,
      customersByStatus,
      topRevenueCustomersData,
      newCustomers,
      customerGrowth,
    ] = await Promise.all([
      // 1. Distribution by type
      prisma.customer.groupBy({
        by: ['type'],
        where: customerWhere,
        _count: { id: true },
      }),

      // 2. Distribution by segment
      prisma.customer.groupBy({
        by: ['segment'],
        where: customerWhere,
        _count: { id: true },
      }),

      // 3. Distribution by lead status
      prisma.customer.groupBy({
        by: ['leadStatus'],
        where: customerWhere,
        _count: { id: true },
      }),

      // 4. Top revenue customers - FIXED: Get IDs first, then fetch details
      prisma.customer.findMany({
        where: {
          ...customerWhere,
          totalRevenue: { gt: 0 },
        },
        select: {
          id: true,
          companyId: true,
          totalRevenue: true,
          totalSales: true,
        },
        orderBy: {
          totalRevenue: 'desc',
        },
        take: 10,
      }),

      // 5. New customers in period
      prisma.customer.count({
        where: {
          ...customerWhere,
          company: {
            createdAt: {
              gte: range.startDate,
              lte: range.endDate,
            },
          },
        },
      }),

      // 6. Customer growth (new vs total)
      prisma.customer.count({
        where: customerWhere,
      }),
    ]);

    // Enrich top customers with company details and period documents
    const topRevenueCustomers = await Promise.all(
      topRevenueCustomersData.map(async (customer) => {
        // Fetch company details
        const company = await prisma.company.findUnique({
          where: { id: customer.companyId },
          select: {
            id: true,
            companyName: true,
            code: true,
            mainEmail: true,
          },
        });

        // Fetch documents in period
        const periodDocuments = await prisma.document.findMany({
          where: {
            customerId: customer.id,
            documentDate: {
              gte: range.startDate,
              lte: range.endDate,
            },
            documentType: { in: ['ORDER', 'INVOICE'] },
            status: { notIn: ['VOIDED', 'REJECTED'] },
          },
          select: {
            totalAmount: true,
          },
        });

        const periodRevenue = periodDocuments.reduce(
          (sum, doc) => sum + toNumber(doc.totalAmount),
          0
        );

        return {
          customerId: customer.id,
          companyId: company?.id || 0,
          companyName: company?.companyName || 'Unknown',
          companyCode: company?.code || 'N/A',
          email: company?.mainEmail || null,
          lifetimeRevenue: toNumber(customer.totalRevenue),
          periodRevenue,
          totalOrders: customer.totalSales,
          periodOrders: periodDocuments.length,
        };
      })
    );

    // Calculate lifetime value ranges - FIXED: Use numeric comparison
    const allCustomers = await prisma.customer.findMany({
      where: customerWhere,
      select: {
        totalRevenue: true,
      },
    });

    const lifetimeValueRanges = allCustomers.reduce((acc: any[], customer) => {
      const revenue = toNumber(customer.totalRevenue);
      
      let range: string;
      if (revenue === 0) {
        range = '0';
      } else if (revenue <= 1000) {
        range = '0-1K';
      } else if (revenue <= 5000) {
        range = '1K-5K';
      } else if (revenue <= 10000) {
        range = '5K-10K';
      } else if (revenue <= 50000) {
        range = '10K-50K';
      } else {
        range = '50K+';
      }

      const existing = acc.find(r => r.range === range);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ range, count: 1 });
      }

      return acc;
    }, []);

    // Sort ranges in correct order
    const rangeOrder = ['0', '0-1K', '1K-5K', '5K-10K', '10K-50K', '50K+'];
    lifetimeValueRanges.sort((a, b) => 
      rangeOrder.indexOf(a.range) - rangeOrder.indexOf(b.range)
    );

    // Calculate active vs inactive customers
    const activeCustomers = await prisma.customer.count({
      where: {
        ...customerWhere,
        documentsOut: {
          some: {
            documentDate: {
              gte: range.startDate,
              lte: range.endDate,
            },
          },
        },
      },
    });

    // Calculate average order value for period
    const periodDocuments = await prisma.document.aggregate({
      where: {
        customerId: { not: null },
        documentDate: {
          gte: range.startDate,
          lte: range.endDate,
        },
        documentType: { in: ['ORDER', 'INVOICE'] },
        status: { notIn: ['VOIDED', 'REJECTED'] },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    const avgOrderValue = periodDocuments._count.id > 0
      ? toNumber(periodDocuments._sum.totalAmount || 0) / periodDocuments._count.id
      : 0;

    res.status(200).json({
      success: true,
      data: {
        period: range,
        summary: {
          total: customerGrowth,
          new: newCustomers,
          active: activeCustomers,
          inactive: customerGrowth - activeCustomers,
          avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        },
        distribution: {
          byType: customersByType.map((g) => ({
            type: g.type,
            count: g._count.id,
            percentage: parseFloat(((g._count.id / customerGrowth) * 100).toFixed(2)),
          })),
          bySegment: customersBySegment.map((g) => ({
            segment: g.segment,
            count: g._count.id,
            percentage: parseFloat(((g._count.id / customerGrowth) * 100).toFixed(2)),
          })),
          byStatus: customersByStatus.map((g) => ({
            status: g.leadStatus,
            count: g._count.id,
            percentage: parseFloat(((g._count.id / customerGrowth) * 100).toFixed(2)),
          })),
          byLifetimeValue: lifetimeValueRanges,
        },
        topCustomers: topRevenueCustomers,
      },
    });
  } catch (error) {
    next(error);
  }
};