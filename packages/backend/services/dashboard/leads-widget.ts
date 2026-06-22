// ============================================================================
// LEADS WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { DashboardScope } from "@mini-erp/shared";

/**
 * Fetch Leads KPI data with correct LeadStatus enum values
 */
export async function fetchLeadsKPI(
  tenantId: string,
  userId: string,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<{
  total: number;
  active: number;
  new: number;
  contacted: number;
  qualified: number;
  nurturing: number;
  converted: number;
  lost: number;
  unqualified: number;
  conversionRate: string;
}> {
  const where: Prisma.LeadWhereInput = {
    tenantId,
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const [total, newLeads, contacted, qualified, nurturing, converted, lost, unqualified] =
    await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.count({ where: { ...where, status: "NEW" } }),
      prisma.lead.count({ where: { ...where, status: "CONTACTED" } }),
      prisma.lead.count({ where: { ...where, status: "QUALIFIED" } }),
      prisma.lead.count({ where: { ...where, status: "NURTURING" } }),
      prisma.lead.count({ where: { ...where, status: "CONVERTED" } }),
      prisma.lead.count({ where: { ...where, status: "LOST" } }),
      prisma.lead.count({ where: { ...where, status: "UNQUALIFIED" } }),
    ]);

  const active = newLeads + contacted + qualified + nurturing;
  const closed = converted + lost + unqualified;
  const conversionRate = closed > 0 ? ((converted / closed) * 100).toFixed(1) : "0.0";

  return {
    total,
    active,
    new: newLeads,
    contacted,
    qualified,
    nurturing,
    converted,
    lost,
    unqualified,
    conversionRate,
  };
}

/**
 * Fetch leads funnel visualization data (NEW → CONTACTED → QUALIFIED → CONVERTED)
 */
export async function fetchLeadsFunnel(
  tenantId: string,
  userId: string,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<
  Array<{
    stage: string;
    count: number;
    percentage: string;
  }>
> {
  const where: Prisma.LeadWhereInput = {
    tenantId,
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const [total, newCount, contacted, qualified, converted] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.count({ where: { ...where, status: "NEW" } }),
    prisma.lead.count({ where: { ...where, status: "CONTACTED" } }),
    prisma.lead.count({ where: { ...where, status: "QUALIFIED" } }),
    prisma.lead.count({ where: { ...where, status: "CONVERTED" } }),
  ]);

  const stages = [
    { stage: "NEW", count: newCount },
    { stage: "CONTACTED", count: contacted },
    { stage: "QUALIFIED", count: qualified },
    { stage: "CONVERTED", count: converted },
  ];

  return stages.map((s) => ({
    stage: s.stage,
    count: s.count,
    percentage: total > 0 ? ((s.count / total) * 100).toFixed(1) : "0.0",
  }));
}

/**
 * Fetch leads requiring follow-up
 */
export async function fetchLeadsFollowUp(
  tenantId: string,
  userId: string,
  limit: number,
  scope: DashboardScope,
): Promise<
  Array<{
    id: string;
    companyName: string | null;
    status: string;
    lastContactDate: Date | null;
    assignedUser: {
      id: string;
      username: string;
    } | null;
  }>
> {
  const where: Prisma.LeadWhereInput = {
    status: { in: ["CONTACTED", "QUALIFIED", "NURTURING"] },
    tenantId,
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  // Leads without recent contact (older than 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  where.OR = [{ lastContactDate: null }, { lastContactDate: { lt: sevenDaysAgo } }];

  const leads = await prisma.lead.findMany({
    where,
    take: limit,
    orderBy: { lastContactDate: "asc" },
    select: {
      id: true,
      companyName: true,
      status: true,
      lastContactDate: true,
      assignedUser: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return leads;
}
/**
 * Fetch leads source distribution
 * Maps to: LEADS_SOURCE widget
 */
export async function fetchLeadsSourceDistribution(
  tenantId: string,
  userId: string,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<Array<{ source: string; count: number; percentage: string }>> {
  const where: Prisma.LeadWhereInput = {
    tenantId,
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const total = await prisma.lead.count({ where });

  const result = await prisma.lead.groupBy({
    by: ["source"],
    where,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  return result.map((r) => ({
    source: r.source ?? "Unknown",
    count: r._count.id,
    percentage: total > 0 ? ((r._count.id / total) * 100).toFixed(1) : "0.0",
  }));
}
