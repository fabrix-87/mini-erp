// ============================================================================
// ACTIVITIES WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { DashboardScope } from "@mini-erp/shared";

/**
 * Fetch recent activities feed
 */
export async function fetchActivitiesFeed(
  userId: number,
  limit: number,
  scope: DashboardScope,
): Promise<
  Array<{
    id: number;
    subject: string;
    type: string;
    priority: string | null;
    status: string;
    scheduledStart: Date;
    createdAt: Date;
    assignedUser: {
      id: number;
      username: string;
    } | null;
  }>
> {
  const where: Prisma.ActivityWhereInput = {};

  if (scope === DashboardScope.OWN) {
    where.OR = [
      { assignedUserId: userId },
      { participants: { some: { userId } } },
    ];
  }

  const activities = await prisma.activity.findMany({
    where,
    take: limit,
    orderBy: { scheduledStart: "desc" },
    select: {
      id: true,
      subject: true,
      type: true,
      priority: true,
      status: true,
      scheduledStart: true,
      createdAt: true,
      assignedUser: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return activities;
}

/**
 * Fetch activities KPI (overdue, today, upcoming)
 */
export async function fetchActivitiesKPI(
  userId: number,
  scope: DashboardScope,
): Promise<{
  total: number;
  overdue: number;
  today: number;
  thisWeek: number;
  completed: number;
  scheduled: number;
  inProgress: number;
}> {
  const where: Prisma.ActivityWhereInput = {};

  if (scope === DashboardScope.OWN) {
    where.OR = [
      { assignedUserId: userId },
      { participants: { some: { userId } } },
    ];
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const [total, overdue, today, thisWeek, completed, scheduled, inProgress] =
    await Promise.all([
      prisma.activity.count({ where }),
      prisma.activity.count({
        where: {
          ...where,
          scheduledStart: { lt: startOfDay },
          status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        },
      }),
      prisma.activity.count({
        where: {
          ...where,
          scheduledStart: { gte: startOfDay, lt: endOfDay },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
      }),
      prisma.activity.count({
        where: {
          ...where,
          scheduledStart: { gte: startOfWeek, lt: endOfWeek },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
      }),
      prisma.activity.count({ where: { ...where, status: "COMPLETED" } }),
      prisma.activity.count({ where: { ...where, status: "SCHEDULED" } }),
      prisma.activity.count({ where: { ...where, status: "IN_PROGRESS" } }),
    ]);

  return {
    total,
    overdue,
    today,
    thisWeek,
    completed,
    scheduled,
    inProgress,
  };
}

/**
 * Fetch activities breakdown by type
 */
export async function fetchActivitiesByType(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<Array<{ type: string; count: number }>> {
  const where: Prisma.ActivityWhereInput = {};

  if (scope === DashboardScope.OWN) {
    where.OR = [
      { assignedUserId: userId },
      { participants: { some: { userId } } },
    ];
  }

  if (dateFrom || dateTo) {
    where.scheduledStart = {};
    if (dateFrom) where.scheduledStart.gte = dateFrom;
    if (dateTo) where.scheduledStart.lte = dateTo;
  }

  const result = await prisma.activity.groupBy({
    by: ["type"],
    where,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  return result.map((r) => ({
    type: r.type,
    count: r._count.id,
  }));
}
