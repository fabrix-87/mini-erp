// ============================================================================
// ALERTS WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-client";
import { Prisma } from "@/generated/prisma/client";
import { DashboardScope } from "@mini-erp/shared";

/**
 * Fetch system alerts and notifications
 */
export async function fetchAlerts(
  userId: number,
  limit: number,
  scope: DashboardScope,
): Promise<
  Array<{
    id: string;
    type:
      | "OVERDUE_INVOICE"
      | "LOW_STOCK"
      | "EXPIRING_QUOTE"
      | "PENDING_ACTIVITY";
    severity: "HIGH" | "MEDIUM" | "LOW";
    message: string;
    createdAt: Date;
    relatedId: number | null;
  }>
> {
  const alerts: Array<{
    id: string;
    type:
      | "OVERDUE_INVOICE"
      | "LOW_STOCK"
      | "EXPIRING_QUOTE"
      | "PENDING_ACTIVITY";
    severity: "HIGH" | "MEDIUM" | "LOW";
    message: string;
    createdAt: Date;
    relatedId: number | null;
  }> = [];

  const now = new Date();

  // 1. Overdue invoices
  const overdueInvoicesWhere: Prisma.DocumentWhereInput = {
    documentType: "INVOICE",
    dueDate: { lt: now },
    status: { in: ["UNPAID", "PARTIALLY_PAID"] },
  };

  if (scope === DashboardScope.OWN) {
    overdueInvoicesWhere.assignedUserId = userId;
  }

  const overdueInvoices = await prisma.document.findMany({
    where: overdueInvoicesWhere,
    take: Math.ceil(limit / 4),
    orderBy: { dueDate: "asc" },
    select: { id: true, documentNumber: true, dueDate: true },
  });

  for (const inv of overdueInvoices) {
    const daysPast = Math.floor(
      (now.getTime() - new Date(inv.dueDate!).getTime()) / (1000 * 60 * 60 * 24),
    );
    alerts.push({
      id: `overdue-invoice-${inv.id}`,
      type: "OVERDUE_INVOICE",
      severity: daysPast > 30 ? "HIGH" : "MEDIUM",
      message: `Invoice ${inv.documentNumber} is ${daysPast} days overdue`,
      createdAt: inv.dueDate!,
      relatedId: inv.id,
    });
  }

  // 2. Low stock alerts
  const lowStock = await prisma.productVariant.findMany({
    where: {
      quantity: { lte: 5 },
      deletedAt: null,
      active: true,
    },
    take: Math.ceil(limit / 4),
    orderBy: { quantity: "asc" },
    select: {
      id: true,
      variantCode: true,
      quantity: true,
      product: { select: { reference: true } },
    },
  });

  for (const variant of lowStock) {
    alerts.push({
      id: `low-stock-${variant.id}`,
      type: "LOW_STOCK",
      severity: variant.quantity === 0 ? "HIGH" : "MEDIUM",
      message: `Product ${variant.product!.reference} (${variant.variantCode}) stock: ${variant.quantity}`,
      createdAt: now,
      relatedId: variant.id,
    });
  }

  // 3. Expiring quotes
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const expiringQuotesWhere: Prisma.DocumentWhereInput = {
    documentType: "QUOTE",
    validUntil: { gte: now, lte: sevenDaysFromNow },
    status: "SENT",
  };

  if (scope === DashboardScope.OWN) {
    expiringQuotesWhere.assignedUserId = userId;
  }

  const expiringQuotes = await prisma.document.findMany({
    where: expiringQuotesWhere,
    take: Math.ceil(limit / 4),
    orderBy: { validUntil: "asc" },
    select: { id: true, documentNumber: true, validUntil: true },
  });

  for (const quote of expiringQuotes) {
    const daysLeft = Math.floor(
      (new Date(quote.validUntil!).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    alerts.push({
      id: `expiring-quote-${quote.id}`,
      type: "EXPIRING_QUOTE",
      severity: "LOW",
      message: `Quote ${quote.documentNumber} expires in ${daysLeft} days`,
      createdAt: quote.validUntil!,
      relatedId: quote.id,
    });
  }

  // 4. Pending activities (overdue)
  const overdueActivitiesWhere: Prisma.ActivityWhereInput = {
    scheduledStart: { lt: now },
    status: { in: ["SCHEDULED", "IN_PROGRESS"] },
  };

  if (scope === DashboardScope.OWN) {
    overdueActivitiesWhere.OR = [
      { assignedUserId: userId },
      { participants: { some: { userId } } },
    ];
  }

  const overdueActivities = await prisma.activity.findMany({
    where: overdueActivitiesWhere,
    take: Math.ceil(limit / 4),
    orderBy: { scheduledStart: "asc" },
    select: { id: true, subject: true, scheduledStart: true },
  });

  for (const act of overdueActivities) {
    const daysPast = Math.floor(
      (now.getTime() - new Date(act.scheduledStart).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    alerts.push({
      id: `overdue-activity-${act.id}`,
      type: "PENDING_ACTIVITY",
      severity: daysPast > 7 ? "HIGH" : "MEDIUM",
      message: `Activity "${act.subject}" is ${daysPast} days overdue`,
      createdAt: act.scheduledStart,
      relatedId: act.id,
    });
  }

  // Sort by severity and date
  const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  alerts.sort((a, b) => {
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return alerts.slice(0, limit);
}
