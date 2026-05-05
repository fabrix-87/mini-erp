// ============================================================================
// REVENUE WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { DashboardScope } from "@mini-erp/shared";

/**
 * Fetch revenue KPI
 */
export async function fetchRevenueKPI(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<{
  totalRevenue: string;
  paidRevenue: string;
  pendingRevenue: string;
  invoicesCount: number;
  averageInvoiceValue: string;
  growthRate: string;
}> {
  const where: Prisma.DocumentWhereInput = {
    documentType: "INVOICE",
    status: { notIn: ["DRAFT", "VOIDED"] },
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.documentDate = {};
    if (dateFrom) where.documentDate.gte = dateFrom;
    if (dateTo) where.documentDate.lte = dateTo;
  }

  const [invoicesCount, totalAgg, paidAgg, pendingAgg] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.aggregate({
      where,
      _sum: { totalAmount: true },
    }),
    prisma.document.aggregate({
      where: { ...where, status: "PAID" },
      _sum: { paidAmount: true },
    }),
    prisma.document.aggregate({
      where: { ...where, status: { in: ["UNPAID", "PARTIALLY_PAID"] } },
      _sum: { totalAmount: true },
    }),
  ]);

  const totalRevenue = parseFloat(totalAgg._sum.totalAmount?.toString() ?? "0");
  const paidRevenue = parseFloat(paidAgg._sum.paidAmount?.toString() ?? "0");
  const pendingRevenue = parseFloat(
    pendingAgg._sum.totalAmount?.toString() ?? "0",
  );

  const averageInvoiceValue =
    invoicesCount > 0 ? (totalRevenue / invoicesCount).toFixed(2) : "0.00";

  // Calculate growth rate vs previous period
  let growthRate = "0.0";
  if (dateFrom && dateTo) {
    const duration = dateTo.getTime() - dateFrom.getTime();
    const previousFrom = new Date(dateFrom.getTime() - duration);
    const previousTo = dateFrom;

    const previousAgg = await prisma.document.aggregate({
      where: {
        ...where,
        documentDate: { gte: previousFrom, lt: previousTo },
      },
      _sum: { totalAmount: true },
    });

    const previousRevenue = parseFloat(
      previousAgg._sum.totalAmount?.toString() ?? "0",
    );
    if (previousRevenue > 0) {
      growthRate = (
        ((totalRevenue - previousRevenue) / previousRevenue) *
        100
      ).toFixed(1);
    }
  }

  return {
    totalRevenue: totalRevenue.toFixed(2),
    paidRevenue: paidRevenue.toFixed(2),
    pendingRevenue: pendingRevenue.toFixed(2),
    invoicesCount,
    averageInvoiceValue,
    growthRate,
  };
}

/**
 * Fetch invoices status distribution
 */
export async function fetchInvoicesStatus(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<Array<{ status: string; count: number; totalAmount: string }>> {
  const where: Prisma.DocumentWhereInput = {
    documentType: "INVOICE",
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.documentDate = {};
    if (dateFrom) where.documentDate.gte = dateFrom;
    if (dateTo) where.documentDate.lte = dateTo;
  }

  const result = await prisma.document.groupBy({
    by: ["status"],
    where,
    _count: { id: true },
    _sum: { totalAmount: true },
    orderBy: { _count: { id: "desc" } },
  });

  return result.map((r) => ({
    status: r.status,
    count: r._count.id,
    totalAmount: r._sum.totalAmount?.toString() ?? "0",
  }));
}

/**
 * Fetch overdue installments
 */
export async function fetchOverdueInstallments(
  userId: number,
  limit: number,
  scope: DashboardScope,
): Promise<
  Array<{
    id: number;
    documentId: number;
    documentNumber: string | null;
    installmentNumber: number;
    amount: any;
    dueDate: Date;
    daysPastDue: number;
    customerName: string | null;
  }>
> {
  const now = new Date();

  const where: Prisma.DocumentPaymentInstallmentWhereInput = {
    dueDate: { lt: now },
    status: { in: ["PENDING", "PARTIAL"] },
  };

  if (scope === DashboardScope.OWN) {
    where.document = { assignedUserId: userId };
  }

  const installments = await prisma.documentPaymentInstallment.findMany({
    where,
    take: limit,
    orderBy: { dueDate: "asc" },
    select: {
      id: true,
      documentId: true,
      installmentNumber: true,
      amount: true,
      dueDate: true,
      document: {
        select: {
          documentNumber: true,
          customerName: true,
        },
      },
    },
  });

  return installments.map((inst) => {
    const daysPastDue = Math.floor(
      (now.getTime() - new Date(inst.dueDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return {
      id: inst.id,
      documentId: inst.documentId,
      documentNumber: inst.document.documentNumber,
      installmentNumber: inst.installmentNumber,
      amount: inst.amount,
      dueDate: inst.dueDate,
      daysPastDue,
      customerName: inst.document.customerName,
    };
  });
}

/**
 * Fetch revenue trend by month
 */
export async function fetchRevenueTrend(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<
  Array<{
    period: string;
    revenue: string;
    invoices: number;
  }>
> {
  const where: Prisma.DocumentWhereInput = {
    documentType: "INVOICE",
    status: { notIn: ["DRAFT", "VOIDED"] },
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.documentDate = {};
    if (dateFrom) where.documentDate.gte = dateFrom;
    if (dateTo) where.documentDate.lte = dateTo;
  }

  const documents = await prisma.document.findMany({
    where,
    select: {
      documentDate: true,
      totalAmount: true,
    },
    orderBy: { documentDate: "asc" },
  });

  // Group by month
  const grouped = new Map<string, { revenue: number; invoices: number }>();

  for (const doc of documents) {
    const date = new Date(doc.documentDate);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!grouped.has(period)) {
      grouped.set(period, { revenue: 0, invoices: 0 });
    }

    const entry = grouped.get(period)!;
    entry.revenue += parseFloat(doc.totalAmount?.toString() ?? "0");
    entry.invoices++;
  }

  return Array.from(grouped.entries()).map(([period, data]) => ({
    period,
    revenue: data.revenue.toFixed(2),
    invoices: data.invoices,
  }));
}
