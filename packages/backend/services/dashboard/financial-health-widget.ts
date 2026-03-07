// ============================================================================
// FINANCIAL HEALTH WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-client";
import { Prisma } from "@/generated/prisma/client";
import { DashboardScope } from "@mini-erp/shared";

/**
 * Fetch cash flow analysis
 */
export async function fetchCashFlow(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<{
  cashIn: string;
  cashOut: string;
  netCashFlow: string;
  openingBalance: string;
  closingBalance: string;
}> {
  const where: Prisma.DocumentWhereInput = {};

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.documentDate = {};
    if (dateFrom) where.documentDate.gte = dateFrom;
    if (dateTo) where.documentDate.lte = dateTo;
  }

  // Cash In (invoices paid)
  const cashInAgg = await prisma.document.aggregate({
    where: {
      ...where,
      documentType: "INVOICE",
      status: "PAID",
    },
    _sum: { paidAmount: true },
  });

  // Cash Out (supplier orders paid)
  const cashOutAgg = await prisma.document.aggregate({
    where: {
      ...where,
      documentType: "SUPPLIER_ORDER",
      status: "PAID",
    },
    _sum: { paidAmount: true },
  });

  const cashIn = parseFloat(cashInAgg._sum.paidAmount?.toString() ?? "0");
  const cashOut = parseFloat(cashOutAgg._sum.paidAmount?.toString() ?? "0");
  const netCashFlow = cashIn - cashOut;

  // Simplified opening/closing balance (would need proper accounting ledger)
  const openingBalance = "0.00"; // TODO: Implement proper balance tracking
  const closingBalance = netCashFlow.toFixed(2);

  return {
    cashIn: cashIn.toFixed(2),
    cashOut: cashOut.toFixed(2),
    netCashFlow: netCashFlow.toFixed(2),
    openingBalance,
    closingBalance,
  };
}

/**
 * Fetch profit margin analysis
 */
export async function fetchProfitMargin(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<{
  revenue: string;
  costs: string;
  grossProfit: string;
  profitMargin: string;
  trend: Array<{ period: string; margin: string }>;
}> {
  const where: Prisma.DocumentWhereInput = {};

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.documentDate = {};
    if (dateFrom) where.documentDate.gte = dateFrom;
    if (dateTo) where.documentDate.lte = dateTo;
  }

  // Revenue
  const revenueAgg = await prisma.document.aggregate({
    where: {
      ...where,
      documentType: "INVOICE",
      status: { notIn: ["DRAFT", "VOIDED"] },
    },
    _sum: { totalAmount: true },
  });

  // Costs (supplier orders)
  const costsAgg = await prisma.document.aggregate({
    where: {
      ...where,
      documentType: "SUPPLIER_ORDER",
      status: { notIn: ["DRAFT", "VOIDED"] },
    },
    _sum: { totalAmount: true },
  });

  const revenue = parseFloat(revenueAgg._sum.totalAmount?.toString() ?? "0");
  const costs = parseFloat(costsAgg._sum.totalAmount?.toString() ?? "0");
  const grossProfit = revenue - costs;
  const profitMargin = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : "0.0";

  // Trend (simplified - monthly)
  const trend: Array<{ period: string; margin: string }> = [];
  // TODO: Implement monthly trend calculation

  return {
    revenue: revenue.toFixed(2),
    costs: costs.toFixed(2),
    grossProfit: grossProfit.toFixed(2),
    profitMargin,
    trend,
  };
}

/**
 * Fetch accounts payable summary
 */
export async function fetchAccountsPayable(
  userId: number,
  scope: DashboardScope,
): Promise<{
  total: string;
  current: string;
  overdue: string;
  overdueCount: number;
}> {
  const where: Prisma.DocumentWhereInput = {
    documentType: "SUPPLIER_ORDER",
    status: { in: ["UNPAID", "PARTIALLY_PAID"] },
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  const now = new Date();

  const [totalAgg, overdueAgg, overdueCount] = await Promise.all([
    prisma.document.aggregate({
      where,
      _sum: { totalAmount: true },
    }),
    prisma.document.aggregate({
      where: { ...where, dueDate: { lt: now } },
      _sum: { totalAmount: true },
    }),
    prisma.document.count({
      where: { ...where, dueDate: { lt: now } },
    }),
  ]);

  const total = parseFloat(totalAgg._sum.totalAmount?.toString() ?? "0");
  const overdue = parseFloat(overdueAgg._sum.totalAmount?.toString() ?? "0");
  const current = total - overdue;

  return {
    total: total.toFixed(2),
    current: current.toFixed(2),
    overdue: overdue.toFixed(2),
    overdueCount,
  };
}

/**
 * Fetch accounts receivable summary
 */
export async function fetchAccountsReceivable(
  userId: number,
  scope: DashboardScope,
): Promise<{
  total: string;
  current: string;
  overdue: string;
  overdueCount: number;
}> {
  const where: Prisma.DocumentWhereInput = {
    documentType: "INVOICE",
    status: { in: ["UNPAID", "PARTIALLY_PAID"] },
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  const now = new Date();

  const [totalAgg, overdueAgg, overdueCount] = await Promise.all([
    prisma.document.aggregate({
      where,
      _sum: { totalAmount: true },
    }),
    prisma.document.aggregate({
      where: { ...where, dueDate: { lt: now } },
      _sum: { totalAmount: true },
    }),
    prisma.document.count({
      where: { ...where, dueDate: { lt: now } },
    }),
  ]);

  const total = parseFloat(totalAgg._sum.totalAmount?.toString() ?? "0");
  const overdue = parseFloat(overdueAgg._sum.totalAmount?.toString() ?? "0");
  const current = total - overdue;

  return {
    total: total.toFixed(2),
    current: current.toFixed(2),
    overdue: overdue.toFixed(2),
    overdueCount,
  };
}
