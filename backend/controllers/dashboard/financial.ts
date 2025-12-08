import { Request, Response, NextFunction } from 'express';
import { getDateRangeFromPeriod, calculateGrowth, toNumber } from '../../helpers/dashboard';
import { prisma } from '../../config/prisma-client';

/**
 * @desc    Statistiche finanziarie (P&L, Cash Flow, AR/AP)
 * @route   GET /api/dashboard/financial
 * @access  Private (dashboard:read, financial:read)
 */
export const getFinancialStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { period = 'thisMonth', startDate: customStart, endDate: customEnd } = req.query;
    
    const { startDate, endDate } = customStart && customEnd
      ? { startDate: new Date(customStart as string), endDate: new Date(customEnd as string) }
      : getDateRangeFromPeriod(period as string);

    // Query parallele per performance
    const [
      revenue,
      expenses,
      accountsReceivable,
      accountsPayable,
      taxByRate,
      previousRevenue,
    ] = await Promise.all([
      // Revenue (Fatture + Ordini)
      prisma.document.aggregate({
        where: {
          documentType: { in: ['INVOICE', 'ORDER'] },
          status: { notIn: ['VOIDED', 'DRAFT'] },
          documentDate: { gte: startDate, lte: endDate },
        },
        _sum: {
          totalAmount: true,
          taxAmount: true,
          paidAmount: true,
        },
      }),

      // Expenses (Ordini Fornitori)
      prisma.document.aggregate({
        where: {
          documentType: 'SUPPLIER_ORDER',
          status: { notIn: ['VOIDED', 'DRAFT'] },
          documentDate: { gte: startDate, lte: endDate },
        },
        _sum: {
          totalAmount: true,
          paidAmount: true,
        },
      }),

      // Accounts Receivable (Fatture non pagate)
      prisma.document.aggregate({
        where: {
          documentType: 'INVOICE',
          status: { in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] },
        },
        _sum: {
          totalAmount: true,
          paidAmount: true,
        },
        _count: { id: true },
      }),

      // Accounts Payable (Ordini fornitori non pagati)
      prisma.document.aggregate({
        where: {
          documentType: 'SUPPLIER_ORDER',
          status: { in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] },
        },
        _sum: {
          totalAmount: true,
          paidAmount: true,
        },
        _count: { id: true },
      }),

      // Tax Summary per aliquota
      prisma.documentLine.groupBy({
        by: ['taxPercent'],
        where: {
          document: {
            documentDate: { gte: startDate, lte: endDate },
            documentType: { in: ['INVOICE', 'ORDER'] },
            status: { notIn: ['VOIDED', 'DRAFT'] },
          },
        },
        _sum: {
          taxAmount: true,
          lineTotal: true,
        },
        orderBy: {
          taxPercent: 'desc',
        },
      }),

      // Previous period per confronto crescita
      (async () => {
        const periodDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const prevStart = new Date(startDate);
        prevStart.setDate(prevStart.getDate() - periodDays);
        const prevEnd = new Date(startDate);
        prevEnd.setDate(prevEnd.getDate() - 1);

        return prisma.document.aggregate({
          where: {
            documentType: { in: ['INVOICE', 'ORDER'] },
            status: { notIn: ['VOIDED', 'DRAFT'] },
            documentDate: { gte: prevStart, lte: prevEnd },
          },
          _sum: { totalAmount: true },
        });
      })(),
    ]);

    // Calcola metriche
    const totalRevenue = toNumber(revenue._sum.totalAmount);
    const totalExpenses = toNumber(expenses._sum.totalAmount);
    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    const cashIn = toNumber(revenue._sum.paidAmount);
    const cashOut = toNumber(expenses._sum.paidAmount);
    const netCashFlow = cashIn - cashOut;

    const arTotal = toNumber(accountsReceivable._sum.totalAmount);
    const arPaid = toNumber(accountsReceivable._sum.paidAmount);
    const arOutstanding = arTotal - arPaid;

    const apTotal = toNumber(accountsPayable._sum.totalAmount);
    const apPaid = toNumber(accountsPayable._sum.paidAmount);
    const apOutstanding = apTotal - apPaid;

    const prevRevenueTotal = toNumber(previousRevenue._sum.totalAmount);
    const revenueGrowth = calculateGrowth(totalRevenue, prevRevenueTotal);

    // Response
    res.status(200).json({
      success: true,
      data: {
        period: { startDate, endDate, label: period },
        revenue: {
          total: totalRevenue,
          tax: toNumber(revenue._sum.taxAmount),
          paid: cashIn,
          growth: revenueGrowth,
        },
        expenses: {
          total: totalExpenses,
          paid: cashOut,
        },
        profit: {
          amount: profit,
          margin: profitMargin.toFixed(2),
        },
        cashFlow: {
          in: cashIn,
          out: cashOut,
          net: netCashFlow,
        },
        accountsReceivable: {
          total: arTotal,
          paid: arPaid,
          outstanding: arOutstanding,
          count: accountsReceivable._count.id,
        },
        accountsPayable: {
          total: apTotal,
          paid: apPaid,
          outstanding: apOutstanding,
          count: accountsPayable._count.id,
        },
        taxSummary: taxByRate.map((t) => ({
          rate: toNumber(t.taxPercent),
          taxAmount: toNumber(t._sum.taxAmount),
          baseAmount: toNumber(t._sum.lineTotal),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};