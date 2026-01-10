import { Response, NextFunction } from 'express';
import { getDateRangeFromPeriod, groupByPeriod, toNumber, daysBetween } from '../../helpers/dashboard';
import { Prisma } from '../../generated/prisma/client';
import { prisma } from '../../config/prisma-client';
import { AuthenticatedValidatedRequest } from '@/types/validate';

/**
 * @desc    Statistiche documenti (Workflow, Pagamenti, Overdue)
 * @route   GET /api/dashboard/documents
 * @access  Private (dashboard:read)
 */
export const getDocumentStatistics = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      period = 'last30days',
      startDate: customStart,
      endDate: customEnd,
      documentType,
      status,
    } = req.query;

    const { startDate, endDate } = customStart && customEnd
      ? { startDate: new Date(customStart as string), endDate: new Date(customEnd as string) }
      : getDateRangeFromPeriod(period as string);

    // Build where clause
    const where: Prisma.DocumentWhereInput = {
      documentDate: { gte: startDate, lte: endDate },
    };

    if (documentType) {
      where.documentType = documentType as any;
    }

    if (status) {
      where.status = status as any;
    }

    // Query parallele
    const [
      summary,
      byType,
      byStatus,
      invoicePaymentStatus,
      overdueInvoices,
      documentFlow,
      processedDocs,
    ] = await Promise.all([
      // Summary totale
      prisma.document.aggregate({
        where,
        _count: { id: true },
        _sum: { totalAmount: true },
      }),

      // Documenti per tipo
      prisma.document.groupBy({
        by: ['documentType'],
        where,
        _count: { id: true },
        _sum: { totalAmount: true },
      }),

      // Documenti per status
      prisma.document.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
        _sum: { totalAmount: true },
      }),

      // Payment status delle fatture
      prisma.document.groupBy({
        by: ['status'],
        where: {
          ...where,
          documentType: 'INVOICE',
        },
        _sum: {
          totalAmount: true,
          paidAmount: true,
        },
        _count: { id: true },
      }),

      // Fatture scadute (overdue)
      prisma.document.findMany({
        where: {
          documentType: 'INVOICE',
          status: 'OVERDUE',
          dueDate: { lt: new Date() },
        },
        select: {
          id: true,
          documentNumber: true,
          customerName: true,
          totalAmount: true,
          paidAmount: true,
          dueDate: true,
        },
        orderBy: { dueDate: 'asc' },
        take: 20,
      }),

      // Document flow per trend
      prisma.document.findMany({
        where,
        select: {
          documentDate: true,
          documentType: true,
          totalAmount: true,
        },
        orderBy: { documentDate: 'asc' },
      }),

      // Processing time (Draft → Sent)
      prisma.document.findMany({
        where: {
          status: { in: ['SENT', 'ACCEPTED', 'PAID'] },
          sentDate: { not: null },
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          createdAt: true,
          sentDate: true,
        },
      }),
    ]);

    // Calcola metriche payment
    const totalInvoiced = invoicePaymentStatus.reduce(
      (sum, s) => sum + toNumber(s._sum.totalAmount),
      0
    );
    const totalPaid = invoicePaymentStatus.reduce(
      (sum, s) => sum + toNumber(s._sum.paidAmount),
      0
    );
    const totalUnpaid = totalInvoiced - totalPaid;

    // Calcola overdue amount
    const overdueAmount = overdueInvoices.reduce(
      (sum, inv) =>
        sum + toNumber(inv.totalAmount) - toNumber(inv.paidAmount),
      0
    );

    // Calcola giorni overdue
    const enrichedOverdue = overdueInvoices.map((inv) => ({
      id: inv.id,
      documentNumber: inv.documentNumber,
      customerName: inv.customerName,
      amount: toNumber(inv.totalAmount),
      paidAmount: toNumber(inv.paidAmount),
      remainingAmount: toNumber(inv.totalAmount) - toNumber(inv.paidAmount),
      dueDate: inv.dueDate,
      daysOverdue: inv.dueDate ? daysBetween(inv.dueDate, new Date()) : 0,
    }));

    // Raggruppa flow per giorno
    const flowByDay = groupByPeriod(
      documentFlow.map((d) => ({
        date: d.documentDate,
        amount: toNumber(d.totalAmount),
        type: d.documentType,
      })),
      'day'
    );

    // Calcola avg processing time (ore)
    const avgProcessingTime =
      processedDocs.length > 0
        ? processedDocs.reduce((sum, doc) => {
            const hours =
              (doc.sentDate!.getTime() - doc.createdAt.getTime()) /
              (1000 * 60 * 60);
            return sum + hours;
          }, 0) / processedDocs.length
        : 0;

    // Response
    res.status(200).json({
      success: true,
      data: {
        period: { startDate, endDate, label: period },
        summary: {
          total: summary._count.id,
          totalAmount: toNumber(summary._sum.totalAmount),
        },
        byType: byType.map((t) => ({
          type: t.documentType,
          count: t._count.id,
          amount: toNumber(t._sum.totalAmount),
        })),
        byStatus: byStatus.map((s) => ({
          status: s.status,
          count: s._count.id,
          amount: toNumber(s._sum.totalAmount),
        })),
        payments: {
          totalInvoiced,
          totalPaid,
          totalUnpaid,
          overdueAmount,
          overdueCount: overdueInvoices.length,
          paymentRate:
            totalInvoiced > 0
              ? ((totalPaid / totalInvoiced) * 100).toFixed(2)
              : '0.00',
        },
        overdueInvoices: enrichedOverdue,
        flow: Object.values(flowByDay),
        metrics: {
          avgProcessingTime: avgProcessingTime.toFixed(2),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};