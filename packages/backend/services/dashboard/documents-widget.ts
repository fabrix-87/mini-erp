// ============================================================================
// DOCUMENTS WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-client";
import { Prisma } from "@/generated/prisma/client";
import { DashboardScope } from "@mini-erp/shared";

/**
 * Fetch documents KPI
 */
export async function fetchDocumentsKPI(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<{
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  paid: number;
  overdue: number;
  totalValue: string;
  paidValue: string;
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

  const now = new Date();

  const [total, draft, sent, accepted, paid, overdue] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.count({ where: { ...where, status: "DRAFT" } }),
    prisma.document.count({ where: { ...where, status: "SENT" } }),
    prisma.document.count({ where: { ...where, status: "ACCEPTED" } }),
    prisma.document.count({ where: { ...where, status: "PAID" } }),
    prisma.document.count({
      where: {
        ...where,
        dueDate: { lt: now },
        status: { in: ["UNPAID", "PARTIALLY_PAID"] },
      },
    }),
  ]);

  const [totalAgg, paidAgg] = await Promise.all([
    prisma.document.aggregate({
      where,
      _sum: { totalAmount: true },
    }),
    prisma.document.aggregate({
      where: { ...where, status: "PAID" },
      _sum: { paidAmount: true },
    }),
  ]);

  return {
    total,
    draft,
    sent,
    accepted,
    paid,
    overdue,
    totalValue: totalAgg._sum.totalAmount?.toString() ?? "0",
    paidValue: paidAgg._sum.paidAmount?.toString() ?? "0",
  };
}

/**
 * Fetch documents breakdown by type (QUOTE, ORDER, INVOICE, DELIVERY_NOTE)
 */
export async function fetchDocumentsByType(
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<Array<{ type: string; count: number; totalValue: string }>> {
  const where: Prisma.DocumentWhereInput = {};

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.documentDate = {};
    if (dateFrom) where.documentDate.gte = dateFrom;
    if (dateTo) where.documentDate.lte = dateTo;
  }

  const result = await prisma.document.groupBy({
    by: ["documentType"],
    where,
    _count: { id: true },
    _sum: { totalAmount: true },
    orderBy: { _count: { id: "desc" } },
  });

  return result.map((r) => ({
    type: r.documentType,
    count: r._count.id,
    totalValue: r._sum.totalAmount?.toString() ?? "0",
  }));
}

/**
 * Fetch recent documents (latest 10)
 */
export async function fetchRecentDocuments(
  userId: number,
  limit: number,
  scope: DashboardScope,
): Promise<
  Array<{
    id: number;
    documentNumber: string | null;
    documentType: string;
    status: string;
    documentDate: Date;
    totalAmount: any;
    customerName: string | null;
  }>
> {
  const where: Prisma.DocumentWhereInput = {};

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  const documents = await prisma.document.findMany({
    where,
    take: limit,
    orderBy: { documentDate: "desc" },
    select: {
      id: true,
      documentNumber: true,
      documentType: true,
      status: true,
      documentDate: true,
      totalAmount: true,
      customerName: true,
    },
  });

  return documents;
}

/**
 * Fetch expiring quotes (quotes expiring within next 7 days)
 */
export async function fetchExpiringQuotes(
  userId: number,
  limit: number,
  scope: DashboardScope,
): Promise<
  Array<{
    id: number;
    documentNumber: string | null;
    customerName: string | null;
    validUntil: Date;
    totalAmount: any;
    daysUntilExpiry: number;
  }>
> {
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const where: Prisma.DocumentWhereInput = {
    documentType: "QUOTE",
    status: "SENT",
    validUntil: { gte: now, lte: sevenDaysFromNow },
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  const quotes = await prisma.document.findMany({
    where,
    take: limit,
    orderBy: { validUntil: "asc" },
    select: {
      id: true,
      documentNumber: true,
      customerName: true,
      validUntil: true,
      totalAmount: true,
    },
  });

  return quotes.map((q) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(q.validUntil!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return {
      id: q.id,
      documentNumber: q.documentNumber,
      customerName: q.customerName,
      validUntil: q.validUntil!,
      totalAmount: q.totalAmount,
      daysUntilExpiry,
    };
  });
}
