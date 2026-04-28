// ============================================================================
// OPPORTUNITIES WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { DashboardScope } from "@mini-erp/shared";

/**
 * Fetch Opportunities KPI data
 */
export async function fetchOpportunitiesKPI(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<{
  total: number;
  open: number;
  won: number;
  lost: number;
  pending: number;
  totalWonValue: string;
  totalPipelineValue: string;
  winRate: string;
}> {
  const where: Prisma.OpportunityWhereInput = {};

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const [total, open, won, lost, pending] = await Promise.all([
    prisma.opportunity.count({ where }),
    prisma.opportunity.count({ where: { ...where, status: "OPEN" } }),
    prisma.opportunity.count({ where: { ...where, status: "WON" } }),
    prisma.opportunity.count({ where: { ...where, status: "LOST" } }),
    prisma.opportunity.count({ where: { ...where, status: "PENDING" } }),
  ]);

  const [wonAgg, pipelineAgg] = await Promise.all([
    prisma.opportunity.aggregate({
      where: { ...where, status: "WON" },
      _sum: { actualValue: true },
    }),
    prisma.opportunity.aggregate({
      where: { ...where, status: "OPEN" },
      _sum: { estimatedValue: true },
    }),
  ]);

  const closed = won + lost;
  const winRate = closed > 0 ? ((won / closed) * 100).toFixed(1) : "0.0";

  return {
    total,
    open,
    won,
    lost,
    pending,
    totalWonValue: wonAgg._sum.actualValue?.toString() ?? "0",
    totalPipelineValue: pipelineAgg._sum.estimatedValue?.toString() ?? "0",
    winRate,
  };
}

/**
 * Fetch opportunities by sales stage (pipeline view)
 */
export async function fetchOpportunitiesPipeline(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<
  Array<{
    stage: string;
    count: number;
    totalValue: string;
    avgProbability: string;
  }>
> {
  const where: Prisma.OpportunityWhereInput = { status: "OPEN" };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const result = await prisma.opportunity.groupBy({
    by: ["stage"],
    where,
    _count: { id: true },
    _sum: { estimatedValue: true },
    _avg: { probability: true },
  });

  return result.map((r) => ({
    stage: r.stage,
    count: r._count.id,
    totalValue: r._sum.estimatedValue?.toString() ?? "0",
    avgProbability: r._avg.probability?.toFixed(1) ?? "0",
  }));
}

/**
 * Fetch opportunities forecast (weighted pipeline value)
 */
export async function fetchOpportunitiesForecast(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<{
  totalPipelineValue: string;
  weightedValue: string;
  expectedCloseThisMonth: string;
  expectedCloseThisQuarter: string;
}> {
  const where: Prisma.OpportunityWhereInput = { status: "OPEN" };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const opportunities = await prisma.opportunity.findMany({
    where,
    select: {
      estimatedValue: true,
      probability: true,
      expectedCloseDate: true,
    },
  });

  const totalPipeline = opportunities.reduce(
    (sum, o) => sum + parseFloat(o.estimatedValue?.toString() ?? "0"),
    0,
  );

  const weightedValue = opportunities.reduce((sum, o) => {
    const value = parseFloat(o.estimatedValue?.toString() ?? "0");
    const prob = parseFloat(o.probability?.toString() ?? "0") / 100;
    return sum + value * prob;
  }, 0);

  // Expected close this month
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const thisMonthOpps = opportunities.filter((o) => {
    if (!o.expectedCloseDate) return false;
    const closeDate = new Date(o.expectedCloseDate);
    return closeDate >= now && closeDate <= endOfMonth;
  });

  const expectedThisMonth = thisMonthOpps.reduce((sum, o) => {
    const value = parseFloat(o.estimatedValue?.toString() ?? "0");
    const prob = parseFloat(o.probability?.toString() ?? "0") / 100;
    return sum + value * prob;
  }, 0);

  // Expected close this quarter
  const quarter = Math.floor(now.getMonth() / 3);
  const endOfQuarter = new Date(now.getFullYear(), (quarter + 1) * 3, 0);

  const thisQuarterOpps = opportunities.filter((o) => {
    if (!o.expectedCloseDate) return false;
    const closeDate = new Date(o.expectedCloseDate);
    return closeDate >= now && closeDate <= endOfQuarter;
  });

  const expectedThisQuarter = thisQuarterOpps.reduce((sum, o) => {
    const value = parseFloat(o.estimatedValue?.toString() ?? "0");
    const prob = parseFloat(o.probability?.toString() ?? "0") / 100;
    return sum + value * prob;
  }, 0);

  return {
    totalPipelineValue: totalPipeline.toFixed(2),
    weightedValue: weightedValue.toFixed(2),
    expectedCloseThisMonth: expectedThisMonth.toFixed(2),
    expectedCloseThisQuarter: expectedThisQuarter.toFixed(2),
  };
}
