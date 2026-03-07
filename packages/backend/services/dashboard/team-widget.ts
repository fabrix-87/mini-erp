// ============================================================================
// TEAM WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-client";
import { Prisma } from "@/generated/prisma/client";

/**
 * Fetch team performance metrics
 */
export async function fetchTeamPerformance(
  dateFrom: Date | null,
  dateTo: Date | null,
  limit: number = 10,
): Promise<
  Array<{
    userId: number;
    username: string;
    leadsCount: number;
    opportunitiesCount: number;
    activitiesCompleted: number;
    revenue: string;
  }>
> {
  const users = await prisma.user.findMany({
    where: { active: true },
    take: limit,
    select: { id: true, username: true },
  });

  const result = [];

  for (const user of users) {
    const leadsWhere: Prisma.LeadWhereInput = { assignedUserId: user.id };
    const oppsWhere: Prisma.OpportunityWhereInput = { assignedUserId: user.id };
    const actsWhere: Prisma.ActivityWhereInput = {
      assignedUserId: user.id,
      status: "COMPLETED",
    };
    const docsWhere: Prisma.DocumentWhereInput = {
      assignedUserId: user.id,
      documentType: "INVOICE",
      status: "PAID",
    };

    if (dateFrom || dateTo) {
      const dateFilter = {} as any;
      if (dateFrom) dateFilter["gte"] = dateFrom;
      if (dateTo) dateFilter["lte"] = dateTo;

      leadsWhere.createdAt = dateFilter;
      oppsWhere.createdAt = dateFilter;
      actsWhere.actualEnd = dateFilter;
      docsWhere.documentDate = dateFilter;
    }

    const [leadsCount, opportunitiesCount, activitiesCompleted, revenueAgg] =
      await Promise.all([
        prisma.lead.count({ where: leadsWhere }),
        prisma.opportunity.count({ where: oppsWhere }),
        prisma.activity.count({ where: actsWhere }),
        prisma.document.aggregate({
          where: docsWhere,
          _sum: { totalAmount: true },
        }),
      ]);

    result.push({
      userId: user.id,
      username: user.username,
      leadsCount,
      opportunitiesCount,
      activitiesCompleted,
      revenue: revenueAgg._sum.totalAmount?.toString() ?? "0",
    });
  }

  // Sort by revenue descending
  result.sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue));

  return result;
}
