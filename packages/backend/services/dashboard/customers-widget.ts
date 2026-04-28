// ============================================================================
// CUSTOMERS WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { DashboardScope } from "@mini-erp/shared";

/**
 * Fetch customers KPI
 */
export async function fetchCustomersKPI(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<{
  total: number;
  active: number;
  inactive: number;
  prospect: number;
  vip: number;
  newCustomers: number;
}> {
  const where: Prisma.CustomerWhereInput = {};

  // Note: Customer model doesn't have direct assignedUserId
  // For scope filtering, we'd need to filter via related opportunities/documents
  // For now, scope OWN will show all customers (adjust based on business logic)

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const [total, active, inactive, prospect, vip] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.count({
      where: { ...where, company: { status: "ACTIVE" } },
    }),
    prisma.customer.count({
      where: { ...where, company: { status: "INACTIVE" } },
    }),
    prisma.customer.count({
      where: { ...where, type: "PROSPECT" },
    }),
    prisma.customer.count({ where: { ...where, segment: "VIP" } }),
  ]);

  // Count customers created in the period
  const newCustomersWhere: Prisma.CustomerWhereInput = {};
  if (dateFrom) {
    newCustomersWhere.createdAt = { gte: dateFrom };
  }
  const newCustomers = await prisma.customer.count({
    where: newCustomersWhere,
  });

  return {
    total,
    active,
    inactive,
    prospect,
    vip,
    newCustomers,
  };
}

/**
 * Fetch top customers by revenue in the period
 */
export async function fetchTopCustomers(
  limit: number,
  dateFrom: Date | null,
  dateTo: Date | null,
): Promise<
  Array<{
    id: number;
    companyName: string;
    totalRevenue: string;
    documentCount: number;
  }>
> {
  const documentWhere: Prisma.DocumentWhereInput = {
    status: { in: ["PAID", "PARTIALLY_PAID"] },
  };

  if (dateFrom || dateTo) {
    documentWhere.documentDate = {};
    if (dateFrom) documentWhere.documentDate.gte = dateFrom;
    if (dateTo) documentWhere.documentDate.lte = dateTo;
  }

  const result = await prisma.customer.findMany({
    where: {
      documentsOut: { some: documentWhere },
    },
    select: {
      id: true,
      company: {
        select: {
          companyName: true,
        },
      },
      documentsOut: {
        where: documentWhere,
        select: {
          totalAmount: true,
        },
      },
    },
  });

  // Calculate revenue and sort
  const customersWithRevenue = result
    .map((customer) => {
      const totalRevenue = customer.documentsOut.reduce(
        (sum, doc) => sum + parseFloat(doc.totalAmount?.toString() ?? "0"),
        0,
      );
      return {
        id: customer.id,
        companyName: customer.company?.companyName ?? "N/A",
        totalRevenue: totalRevenue.toFixed(2),
        documentCount: customer.documentsOut.length,
      };
    })
    .sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue))
    .slice(0, limit);

  return customersWithRevenue;
}

/**
 * Fetch customer lifecycle distribution (via Company.status: PROSPECT, ACTIVE, INACTIVE)
 */
export async function fetchCustomerLifecycle(
  dateFrom: Date | null,
  dateTo: Date | null,
): Promise<Array<{ status: string; count: number }>> {
  const where: Prisma.CustomerWhereInput = {};

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  // Group by company status
  const customers = await prisma.customer.findMany({
    where,
    select: {
      company: {
        select: {
          status: true,
        },
      },
    },
  });

  // Count by status
  const statusCounts = new Map<string, number>();
  for (const customer of customers) {
    const status = customer.company?.status ?? "UNKNOWN";
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  }

  return Array.from(statusCounts.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}
