// ============================================================================
// ALERTS WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-config";
import { MovementType, Prisma } from "@/generated/prisma/client";
import { DashboardScope } from "@mini-erp/shared";

/**
 * Fetch system alerts and notifications
 */
/**
 * Fetch system alerts and notifications.
 * Requires tenantId for multi-tenant safety.
 */
export async function fetchAlerts(
  tenantId: string,
  userId: string,
  limit: number,
  scope: DashboardScope,
): Promise<
  Array<{
    id: string;
    type: "OVERDUE_INVOICE" | "LOW_STOCK" | "EXPIRING_QUOTE" | "PENDING_ACTIVITY";
    severity: "HIGH" | "MEDIUM" | "LOW";
    message: string;
    createdAt: Date;
    relatedId: string | null; // fixed: all PKs are cuid() strings
  }>
> {
  const alerts: Array<{
    id: string;
    type: "OVERDUE_INVOICE" | "LOW_STOCK" | "EXPIRING_QUOTE" | "PENDING_ACTIVITY";
    severity: "HIGH" | "MEDIUM" | "LOW";
    message: string;
    createdAt: Date;
    relatedId: string | null;
  }> = [];

  const now = new Date();
  const bucket = Math.ceil(limit / 4);

  // ─── 1. Overdue invoices ────────────────────────────────────────────────────
  const overdueInvoices = await prisma.document.findMany({
    where: {
      tenantId,
      documentType: "INVOICE",
      dueDate: { lt: now },
      // OVERDUE = past-due with outstanding balance; UNPAID/PARTIALLY_PAID
      // may not yet be past due but are included for upcoming reminders.
      status: { in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] },
      deletedAt: null,
      ...(scope === DashboardScope.OWN && { assignedUserId: userId }),
    },
    take: bucket,
    orderBy: { dueDate: "asc" },
    select: { id: true, documentNumber: true, dueDate: true, status: true },
  });

  for (const inv of overdueInvoices) {
    const daysPast = Math.floor((now.getTime() - inv.dueDate!.getTime()) / (1000 * 60 * 60 * 24));
    alerts.push({
      id: `overdue-invoice-${inv.id}`,
      type: "OVERDUE_INVOICE",
      // HIGH if explicitly OVERDUE status or more than 30 days past
      severity: inv.status === "OVERDUE" || daysPast > 30 ? "HIGH" : "MEDIUM",
      message: `Invoice ${inv.documentNumber} is ${daysPast} days overdue`,
      createdAt: inv.dueDate!,
      relatedId: inv.id,
    });
  }

  // ─── 2. Low stock alerts ────────────────────────────────────────────────────
  // Stock lives in StockMovement (ledger). We aggregate CONFIRMED movements
  // per variant and compare against each variant's lowStockThreshold.
  // Only variants with lowStockAlertEnabled = true are returned.
  const INBOUND: MovementType[] = [
    "PURCHASE",
    "RETURN_IN",
    "ADJUSTMENT_IN",
    "TRANSFER_IN",
    "INVENTORY_START",
  ];
  const OUTBOUND: MovementType[] = ["SALE", "RETURN_OUT", "ADJUSTMENT_OUT", "TRANSFER_OUT"];

  const [inboundAgg, outboundAgg] = await Promise.all([
    prisma.stockMovement.groupBy({
      by: ["productVariantId"],
      where: {
        status: "CONFIRMED",
        movementType: { in: INBOUND },
        productVariant: { tenantId, deletedAt: null, active: true },
      },
      _sum: { quantity: true },
    }),
    prisma.stockMovement.groupBy({
      by: ["productVariantId"],
      where: {
        status: "CONFIRMED",
        movementType: { in: OUTBOUND },
        productVariant: { tenantId, deletedAt: null, active: true },
      },
      _sum: { quantity: true },
    }),
  ]);

  const inboundMap = new Map(inboundAgg.map((r) => [r.productVariantId, r._sum.quantity ?? 0]));
  const outboundMap = new Map(outboundAgg.map((r) => [r.productVariantId, r._sum.quantity ?? 0]));

  const allVariantIds = [...new Set([...inboundMap.keys(), ...outboundMap.keys()])];

  const alertVariants = await prisma.productVariant.findMany({
    where: {
      id: { in: allVariantIds },
      tenantId,
      deletedAt: null,
      active: true,
      lowStockAlertEnabled: true,
    },
    select: {
      id: true,
      sku: true,
      variantCode: true,
      lowStockThreshold: true,
      product: {
        select: {
          reference: true,
          translations: {
            orderBy: { createdAt: "asc" },
            take: 1,
            select: { name: true },
          },
        },
      },
    },
  });

  const lowStockResults = alertVariants
    .map((v) => {
      const stock = (inboundMap.get(v.id) ?? 0) - (outboundMap.get(v.id) ?? 0);
      const threshold = v.lowStockThreshold > 0 ? v.lowStockThreshold : 5;
      return { v, stock, threshold };
    })
    .filter(({ stock, threshold }) => stock <= threshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, bucket);

  for (const { v, stock } of lowStockResults) {
    const productName = v.product!.translations[0]?.name ?? v.product!.reference;
    alerts.push({
      id: `low-stock-${v.id}`,
      type: "LOW_STOCK",
      severity: stock <= 0 ? "HIGH" : "MEDIUM",
      message: `Product ${productName} (${v.sku}) stock: ${stock}`,
      createdAt: now,
      relatedId: v.id,
    });
  }

  // ─── 3. Expiring quotes ─────────────────────────────────────────────────────
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const expiringQuotes = await prisma.document.findMany({
    where: {
      tenantId,
      documentType: "QUOTE",
      validUntil: { gte: now, lte: sevenDaysFromNow },
      status: "SENT",
      deletedAt: null,
      ...(scope === DashboardScope.OWN && { assignedUserId: userId }),
    },
    take: bucket,
    orderBy: { validUntil: "asc" },
    select: { id: true, documentNumber: true, validUntil: true },
  });

  for (const quote of expiringQuotes) {
    const daysLeft = Math.floor(
      (quote.validUntil!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    alerts.push({
      id: `expiring-quote-${quote.id}`,
      type: "EXPIRING_QUOTE",
      severity: daysLeft <= 2 ? "HIGH" : daysLeft <= 5 ? "MEDIUM" : "LOW",
      message: `Quote ${quote.documentNumber} expires in ${daysLeft} days`,
      createdAt: quote.validUntil!,
      relatedId: quote.id,
    });
  }

  // ─── 4. Overdue activities ──────────────────────────────────────────────────
  const overdueActivities = await prisma.activity.findMany({
    where: {
      tenantId,
      scheduledStart: { lt: now },
      status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      ...(scope === DashboardScope.OWN && {
        AND: [
          {
            OR: [{ assignedUserId: userId }, { participants: { some: { userId } } }],
          },
        ],
      }),
    },
    take: bucket,
    orderBy: { scheduledStart: "asc" },
    select: { id: true, subject: true, scheduledStart: true, priority: true },
  });

  for (const act of overdueActivities) {
    const daysPast = Math.floor(
      (now.getTime() - act.scheduledStart.getTime()) / (1000 * 60 * 60 * 24),
    );
    // Respect the activity's own priority field for severity mapping
    const severity: "HIGH" | "MEDIUM" | "LOW" =
      act.priority === "URGENT" || act.priority === "HIGH" || daysPast > 7
        ? "HIGH"
        : act.priority === "MEDIUM" || daysPast > 3
          ? "MEDIUM"
          : "LOW";

    alerts.push({
      id: `overdue-activity-${act.id}`,
      type: "PENDING_ACTIVITY",
      severity,
      message: `Activity "${act.subject}" is ${daysPast} days overdue`,
      createdAt: act.scheduledStart,
      relatedId: act.id,
    });
  }

  // ─── Sort: severity DESC, then date ASC ────────────────────────────────────
  const severityOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  alerts.sort((a, b) => {
    const diff = severityOrder[b.severity] - severityOrder[a.severity];
    if (diff !== 0) return diff;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return alerts.slice(0, limit);
}
