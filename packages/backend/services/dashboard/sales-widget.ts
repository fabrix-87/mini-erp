// ============================================================================
// SALES WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-client";
import { Prisma } from "@/generated/prisma/client";
import { DashboardScope } from "@mini-erp/shared";

/**
 * Fetch sales KPI
 */
export async function fetchSalesKPI(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<{
  totalRevenue: string;
  totalOrders: number;
  totalInvoices: number;
  averageOrderValue: string;
  paidAmount: string;
  pendingAmount: string;
}> {
  const where: Prisma.DocumentWhereInput = {
    documentType: { in: ["ORDER", "INVOICE"] },
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

  const [totalOrders, totalInvoices] = await Promise.all([
    prisma.document.count({ where: { ...where, documentType: "ORDER" } }),
    prisma.document.count({ where: { ...where, documentType: "INVOICE" } }),
  ]);

  const [revenueAgg, paidAgg, pendingAgg] = await Promise.all([
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

  const totalRevenue = parseFloat(revenueAgg._sum.totalAmount?.toString() ?? "0");
  const totalCount = totalOrders + totalInvoices;
  const averageOrderValue = totalCount > 0 ? (totalRevenue / totalCount).toFixed(2) : "0.00";

  return {
    totalRevenue: totalRevenue.toFixed(2),
    totalOrders,
    totalInvoices,
    averageOrderValue,
    paidAmount: paidAgg._sum.paidAmount?.toString() ?? "0",
    pendingAmount: pendingAgg._sum.totalAmount?.toString() ?? "0",
  };
}

/**
 * Fetch sales trend by month
 */
export async function fetchSalesTrend(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<
  Array<{
    period: string;
    revenue: string;
    orders: number;
    invoices: number;
  }>
> {
  const where: Prisma.DocumentWhereInput = {
    documentType: { in: ["ORDER", "INVOICE"] },
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
      documentType: true,
      totalAmount: true,
    },
    orderBy: { documentDate: "asc" },
  });

  // Group by month
  const grouped = new Map<
    string,
    { revenue: number; orders: number; invoices: number }
  >();

  for (const doc of documents) {
    const date = new Date(doc.documentDate);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!grouped.has(period)) {
      grouped.set(period, { revenue: 0, orders: 0, invoices: 0 });
    }

    const entry = grouped.get(period)!;
    entry.revenue += parseFloat(doc.totalAmount?.toString() ?? "0");
    if (doc.documentType === "ORDER") entry.orders++;
    if (doc.documentType === "INVOICE") entry.invoices++;
  }

  return Array.from(grouped.entries()).map(([period, data]) => ({
    period,
    revenue: data.revenue.toFixed(2),
    orders: data.orders,
    invoices: data.invoices,
  }));
}
