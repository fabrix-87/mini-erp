import { Request, Response, NextFunction } from 'express';
import { getDateRangeFromPeriod, getPreviousPeriod, calculateGrowth, toNumber } from '../../helpers/dashboard';
import { prisma } from '../../config/prisma-client';

/**
 * @desc    Dashboard Overview - KPI principali
 * @route   GET /api/dashboard/overview
 * @access  Private (dashboard:read)
 */
export const getDashboardOverview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { period = 'last30days', startDate: customStart, endDate: customEnd } = req.query;
    
    const { startDate, endDate } = customStart && customEnd
      ? { startDate: new Date(customStart as string), endDate: new Date(customEnd as string) }
      : getDateRangeFromPeriod(period as string);

    // Query parallele per performance
    const [salesStats, opportunityStats, customerStats, documentStats, recentActivities] = 
      await Promise.all([
        // Sales totali
        prisma.document.aggregate({
          where: {
            documentType: { in: ['INVOICE', 'ORDER'] },
            status: { notIn: ['VOIDED', 'DRAFT'] },
            documentDate: { gte: startDate, lte: endDate },
          },
          _sum: { totalAmount: true },
          _count: { id: true },
        }),

        // Opportunità per status
        prisma.opportunity.groupBy({
          by: ['status'],
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
          _sum: { estimatedValue: true, weightedValue: true },
          _count: { id: true },
        }),

        // Clienti per lead status
        prisma.customer.groupBy({
          by: ['leadStatus'],
          _count: { id: true },
        }),

        // Documenti per tipo
        prisma.document.groupBy({
          by: ['documentType'],
          where: {
            documentDate: { gte: startDate, lte: endDate },
          },
          _count: { id: true },
          _sum: { totalAmount: true },
        }),

        // Attività recenti
        prisma.document.findMany({
          where: {
            documentDate: { gte: startDate, lte: endDate },
          },
          select: {
            id: true,
            documentNumber: true,
            documentType: true,
            status: true,
            documentDate: true,
            totalAmount: true,
            customerName: true,
          },
          orderBy: { documentDate: 'desc' },
          take: 10,
        }),
      ]);

    // Calcola periodo precedente per confronto
    const prevPeriod = getPreviousPeriod(startDate, endDate);
    const prevSalesStats = await prisma.document.aggregate({
      where: {
        documentType: { in: ['INVOICE', 'ORDER'] },
        status: { notIn: ['VOIDED', 'DRAFT'] },
        documentDate: { gte: prevPeriod.startDate, lte: prevPeriod.endDate },
      },
      _sum: { totalAmount: true },
    });

    // Formatta risposta
    const totalSales = toNumber(salesStats._sum.totalAmount);
    const prevTotalSales = toNumber(prevSalesStats._sum.totalAmount);

    const opportunitySummary = {
      total: opportunityStats.reduce((sum, s) => sum + s._count.id, 0),
      open: opportunityStats.find(s => s.status === 'OPEN')?._count.id || 0,
      won: opportunityStats.find(s => s.status === 'WON')?._count.id || 0,
      lost: opportunityStats.find(s => s.status === 'LOST')?._count.id || 0,
      totalValue: opportunityStats.reduce((sum, s) => sum + toNumber(s._sum.estimatedValue), 0),
      weightedValue: opportunityStats.reduce((sum, s) => sum + toNumber(s._sum.weightedValue), 0),
    };

    const customerSummary = {
      total: customerStats.reduce((sum, s) => sum + s._count.id, 0),
      new: customerStats.find(s => s.leadStatus === 'NEW')?._count.id || 0,
      qualified: customerStats.find(s => s.leadStatus === 'QUALIFIED')?._count.id || 0,
      closedWon: customerStats.find(s => s.leadStatus === 'CLOSED_WON')?._count.id || 0,
    };

    res.status(200).json({
      success: true,
      data: {
        period: { startDate, endDate, label: period },
        sales: {
          total: totalSales,
          count: salesStats._count.id,
          growth: calculateGrowth(totalSales, prevTotalSales),
          comparison: { current: totalSales, previous: prevTotalSales },
        },
        opportunities: opportunitySummary,
        customers: customerSummary,
        documents: {
          total: documentStats.reduce((sum, s) => sum + s._count.id, 0),
          byType: documentStats.reduce((acc, stat) => {
            acc[stat.documentType] = {
              count: stat._count.id,
              amount: toNumber(stat._sum.totalAmount),
            };
            return acc;
          }, {} as Record<string, any>),
        },
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};