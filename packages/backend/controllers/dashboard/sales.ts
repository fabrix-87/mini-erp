import { Response, NextFunction } from 'express';
import { getDateRangeFromPeriod, groupByPeriod, toNumber } from '../../helpers/dashboard';
import { Prisma } from '../../generated/prisma/client';
import { prisma } from '../../config/prisma-client';
import { AuthenticatedValidatedRequest } from '@/types/validate';

/**
 * @desc    Statistiche vendite dettagliate
 * @route   GET /api/dashboard/sales
 * @access  Private (dashboard:read)
 */
export const getSalesStatistics = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      period = 'last30days',
      startDate: customStart,
      endDate: customEnd,
      customerId,
      assignedUserId,
      groupBy = 'day',
    } = req.query;

    const { startDate, endDate } = customStart && customEnd
      ? { startDate: new Date(customStart as string), endDate: new Date(customEnd as string) }
      : getDateRangeFromPeriod(period as string);

    const where: Prisma.DocumentWhereInput = {
      documentType: { in: ['INVOICE', 'ORDER'] },
      status: { notIn: ['VOIDED', 'DRAFT'] },
      documentDate: { gte: startDate, lte: endDate },
    };

    if (customerId) where.customerId = customerId as unknown as number;
    if (assignedUserId) where.assignedUserId = assignedUserId as unknown as number;

    // Query parallele
    const [totals, documents, topProducts, topCustomers] = await Promise.all([
      // Totali aggregati
      prisma.document.aggregate({
        where,
        _sum: { totalAmount: true, taxAmount: true, paidAmount: true },
        _count: { id: true },
        _avg: { totalAmount: true },
      }),

      // Documenti per trend
      prisma.document.findMany({
        where,
        select: {
          documentDate: true,
          totalAmount: true,
          documentType: true,
        },
        orderBy: { documentDate: 'asc' },
      }),

      // Top 10 prodotti
      prisma.documentLine.groupBy({
        by: ['productId'],
        where: { document: where, productId: { not: null } },
        _sum: { lineTotal: true, quantity: true },
        _count: { id: true },
        orderBy: { _sum: { lineTotal: 'desc' } },
        take: 10,
      }),

      // Top 10 clienti
      prisma.document.groupBy({
        by: ['customerId'],
        where: { ...where, customerId: { not: null } },
        _sum: { totalAmount: true },
        _count: { id: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 10,
      }),
    ]);

    // Raggruppa trend
    const trend = groupByPeriod(
      documents.map(d => ({
        date: d.documentDate,
        amount: toNumber(d.totalAmount),
        type: d.documentType,
      })),
      groupBy as 'day' | 'week' | 'month' | 'year'
    );

    // Arricchisci top products
    const enrichedProducts = await Promise.all(
      topProducts.map(async (p) => {
        const product = await prisma.product.findUnique({
          where: { id: p.productId! },
          select: {
            reference: true,
            translations: { select: { name: true }, take: 1 },
          },
        });

        return {
          productId: p.productId,
          name: product?.translations[0]?.name || product?.reference || 'N/A',
          reference: product?.reference,
          revenue: toNumber(p._sum.lineTotal),
          quantity: toNumber(p._sum.quantity),
          orderCount: p._count.id,
        };
      })
    );

    // Arricchisci top customers
    const enrichedCustomers = await Promise.all(
      topCustomers.map(async (c) => {
        const customer = await prisma.customer.findUnique({
          where: { id: c.customerId! },
          select: {
            company: {
              select: { companyName: true, code: true },
            },
          },
        });

        return {
          customerId: c.customerId,
          companyName: customer?.company.companyName || 'N/A',
          companyCode: customer?.company.code,
          revenue: toNumber(c._sum.totalAmount),
          orderCount: c._count.id,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        period: { startDate, endDate },
        totals: {
          revenue: toNumber(totals._sum.totalAmount),
          tax: toNumber(totals._sum.taxAmount),
          paid: toNumber(totals._sum.paidAmount),
          count: totals._count.id,
          average: toNumber(totals._avg.totalAmount),
        },
        trend: Object.values(trend),
        topProducts: enrichedProducts,
        topCustomers: enrichedCustomers,
      },
    });
  } catch (error) {
    next(error);
  }
};