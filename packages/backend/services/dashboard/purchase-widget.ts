// ============================================================================
// PURCHASE WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-client";
import { Prisma } from "@/generated/prisma/client";
import { DashboardScope } from "@mini-erp/shared";

/**
 * Fetch supplier orders KPI
 */
export async function fetchSupplierOrdersKPI(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<{
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalValue: string;
  averageOrderValue: string;
}> {
  const where: Prisma.DocumentWhereInput = {
    documentType: "SUPPLIER_ORDER",
    supplierId: { not: null },
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.documentDate = {};
    if (dateFrom) where.documentDate.gte = dateFrom;
    if (dateTo) where.documentDate.lte = dateTo;
  }

  const [totalOrders, pendingOrders, completedOrders, totalAgg] =
    await Promise.all([
      prisma.document.count({ where }),
      prisma.document.count({
        where: { ...where, status: { in: ["PENDING_APPROVAL", "SENT"] } },
      }),
      prisma.document.count({
        where: { ...where, status: { in: ["CLOSED", "DELIVERED"] } },
      }),
      prisma.document.aggregate({
        where,
        _sum: { totalAmount: true },
      }),
    ]);

  const totalValue = parseFloat(totalAgg._sum.totalAmount?.toString() ?? "0");
  const averageOrderValue =
    totalOrders > 0 ? (totalValue / totalOrders).toFixed(2) : "0.00";

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    totalValue: totalValue.toFixed(2),
    averageOrderValue,
  };
}

/**
 * Fetch purchase trend by month
 */
export async function fetchPurchaseTrend(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<
  Array<{
    period: string;
    purchases: string;
    orders: number;
  }>
> {
  const where: Prisma.DocumentWhereInput = {
    documentType: "SUPPLIER_ORDER",
    supplierId: { not: null },
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
  const grouped = new Map<string, { purchases: number; orders: number }>();

  for (const doc of documents) {
    const date = new Date(doc.documentDate);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!grouped.has(period)) {
      grouped.set(period, { purchases: 0, orders: 0 });
    }

    const entry = grouped.get(period)!;
    entry.purchases += parseFloat(doc.totalAmount?.toString() ?? "0");
    entry.orders++;
  }

  return Array.from(grouped.entries()).map(([period, data]) => ({
    period,
    purchases: data.purchases.toFixed(2),
    orders: data.orders,
  }));
}
