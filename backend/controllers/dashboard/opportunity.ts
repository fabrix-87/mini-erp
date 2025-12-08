import { Request, Response, NextFunction } from 'express';
import { toNumber, daysBetween } from '../../helpers/dashboard';
import { prisma } from '../../config/prisma-client';
import { Prisma } from '../../generated/prisma/client';


/**
 * @desc    Statistiche opportunità (Pipeline CRM)
 * @route   GET /api/dashboard/opportunities
 * @access  Private (dashboard:read)
 */
export const getOpportunityStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { assignedUserId } = req.query;

    const where: Prisma.OpportunityWhereInput = assignedUserId
      ? { assignedUserId: assignedUserId as unknown as number }
      : {};

    const [pipelineByStage, closedStats, avgDealSize, wonOpportunities, topPerformers] = 
      await Promise.all([
        // Pipeline per stage
        prisma.opportunity.groupBy({
          by: ['stage'],
          where: { status: 'OPEN', ...where },
          _sum: { estimatedValue: true, weightedValue: true },
          _count: { id: true },
          _avg: { probability: true },
        }),

        // Win/Lost ultimi 6 mesi
        prisma.opportunity.groupBy({
          by: ['status'],
          where: {
            status: { in: ['WON', 'LOST'] },
            closedDate: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
          },
          _count: { id: true },
        }),

        // Media deal size
        prisma.opportunity.aggregate({
          where: { status: 'WON' },
          _avg: { estimatedValue: true },
        }),

        // Deal vinti per calcolare sales cycle
        prisma.opportunity.findMany({
          where: { status: 'WON', closedDate: { not: null } },
          select: { createdAt: true, closedDate: true },
        }),

        // Top performers (ultimi 3 mesi)
        prisma.opportunity.groupBy({
          by: ['assignedUserId'],
          where: {
            status: 'WON',
            closedDate: { gte: new Date(new Date().setMonth(new Date().getMonth() - 3)) },
            assignedUserId: { not: null },
          },
          _sum: { estimatedValue: true },
          _count: { id: true },
          orderBy: { _sum: { estimatedValue: 'desc' } },
          take: 10,
        }),
      ]);

    // Calcola metriche
    const wonCount = closedStats.find(s => s.status === 'WON')?._count.id || 0;
    const lostCount = closedStats.find(s => s.status === 'LOST')?._count.id || 0;
    const winRate = wonCount + lostCount > 0 ? (wonCount / (wonCount + lostCount)) * 100 : 0;

    const avgSalesCycle = wonOpportunities.length > 0
      ? wonOpportunities.reduce((sum, opp) => 
          sum + daysBetween(opp.createdAt, opp.closedDate!), 0
        ) / wonOpportunities.length
      : 0;

    // Arricchisci top performers
    const enrichedPerformers = await Promise.all(
      topPerformers.map(async (p) => {
        const user = await prisma.user.findUnique({
          where: { id: p.assignedUserId! },
          select: {
            username: true,
            details: {
              select: { firstName: true, lastName: true },
            },
          },
        });

        return {
          userId: p.assignedUserId,
          username: user?.username,
          fullName: user?.details
            ? `${user.details.firstName} ${user.details.lastName}`
            : user?.username,
          revenue: toNumber(p._sum.estimatedValue),
          dealsWon: p._count.id,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        pipeline: pipelineByStage.map(s => ({
          stage: s.stage,
          count: s._count.id,
          totalValue: toNumber(s._sum.estimatedValue),
          weightedValue: toNumber(s._sum.weightedValue),
          avgProbability: s._avg.probability,
        })),
        metrics: {
          winRate: winRate.toFixed(2),
          avgDealSize: toNumber(avgDealSize._avg.estimatedValue),
          avgSalesCycle: avgSalesCycle.toFixed(0),
        },
        topPerformers: enrichedPerformers,
      },
    });
  } catch (error) {
    next(error);
  }
};