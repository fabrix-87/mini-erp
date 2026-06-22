// ============================================================================
// FINANCIAL WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { DashboardScope } from "@mini-erp/shared";

/**
 * Fetch financial KPI
 */
export async function fetchFinancialKPI(
  tenantId: string,
  userId: string,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<{
  totalReceivable: string;
  totalPaid: string;
  totalOverdue: string;
  overdueCount: number;
  cashFlow: string;
  profitMargin: string;
}> {
  const where: Prisma.DocumentWhereInput = {
    documentType: "INVOICE",
    tenantId,
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.documentDate = {};
    if (dateFrom) where.documentDate.gte = dateFrom;
    if (dateTo) where.documentDate.lte = dateTo;
  }

  const now = new Date();

  const [receivableAgg, paidAgg, overdueAgg, overdueCount] = await Promise.all([
    prisma.document.aggregate({
      where: { ...where, status: { in: ["UNPAID", "PARTIALLY_PAID"] } },
      _sum: { totalAmount: true },
    }),
    prisma.document.aggregate({
      where: { ...where, status: "PAID" },
      _sum: { paidAmount: true },
    }),
    prisma.document.aggregate({
      where: {
        ...where,
        dueDate: { lt: now },
        status: { in: ["UNPAID", "PARTIALLY_PAID"] },
      },
      _sum: { totalAmount: true },
    }),
    prisma.document.count({
      where: {
        ...where,
        dueDate: { lt: now },
        status: { in: ["UNPAID", "PARTIALLY_PAID"] },
      },
    }),
  ]);

  const totalReceivable = parseFloat(receivableAgg._sum.totalAmount?.toString() ?? "0");
  const totalPaid = parseFloat(paidAgg._sum.paidAmount?.toString() ?? "0");
  const totalOverdue = parseFloat(overdueAgg._sum.totalAmount?.toString() ?? "0");

  // Cash flow = paid - receivable (simplified)
  const cashFlow = totalPaid - totalReceivable;

  // Profit margin = (paid / (paid + receivable)) * 100 (simplified)
  const total = totalPaid + totalReceivable;
  const profitMargin = total > 0 ? ((totalPaid / total) * 100).toFixed(1) : "0.0";

  return {
    totalReceivable: totalReceivable.toFixed(2),
    totalPaid: totalPaid.toFixed(2),
    totalOverdue: totalOverdue.toFixed(2),
    overdueCount,
    cashFlow: cashFlow.toFixed(2),
    profitMargin,
  };
}

/**
 * Fetch payment status distribution
 */
export async function fetchPaymentStatusDistribution(
  tenantId: string,
  userId: string,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<Array<{ status: string; count: number; totalAmount: string }>> {
  const where: Prisma.DocumentWhereInput = {
    documentType: "INVOICE",
    tenantId,
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
