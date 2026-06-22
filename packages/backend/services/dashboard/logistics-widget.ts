// ============================================================================
// LOGISTICS WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { DashboardScope, MovementType } from "@mini-erp/shared";

/**
 * Fetch deliveries KPI
 */
export async function fetchDeliveriesKPI(
  tenantId: string,
  userId: string,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<{
  totalDeliveries: number;
  pending: number;
  inTransit: number;
  delivered: number;
  onTime: number;
  delayed: number;
}> {
  const where: Prisma.DocumentWhereInput = {
    documentType: "DELIVERY_NOTE",
    tenantId,
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.documentDate = {};
    if (dateFrom) where.documentDate.gte = dateFrom;
    if (dateTo) where.documentDate.lte = dateTo;
  }

  const [totalDeliveries, pending, inTransit, delivered] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.count({ where: { ...where, status: "PREPARING" } }),
    prisma.document.count({ where: { ...where, status: "IN_TRANSIT" } }),
    prisma.document.count({ where: { ...where, status: "DELIVERED" } }),
  ]);

  // On-time vs delayed deliveries
  const deliveredDocs = await prisma.document.findMany({
    where: {
      ...where,
      status: "DELIVERED",
      deliveryDate: { not: null },
    },
    select: {
      deliveryDate: true,
      dueDate: true,
    },
  });

  let onTime = 0;
  let delayed = 0;

  for (const doc of deliveredDocs) {
    if (doc.deliveryDate && doc.dueDate) {
      if (doc.deliveryDate <= doc.dueDate) {
        onTime++;
      } else {
        delayed++;
      }
    }
  }

  return {
    totalDeliveries,
    pending,
    inTransit,
    delivered,
    onTime,
    delayed,
  };
}

/**
 * Fetch stock alerts (low stock + out of stock) for PHYSICAL warehouses.
 * Stock is computed by aggregating CONFIRMED StockMovements (ledger model).
 * VirtualStock warehouses are excluded — they have a separate snapshot model.
 */
export async function fetchStockAlerts(
  tenantId: string,
  limit: number,
): Promise<
  Array<{
    variantId: string;
    sku: string;
    variantCode: string;
    productReference: string;
    productName: string;
    currentStock: number;
    lowStockThreshold: number;
    alertType: "LOW_STOCK" | "OUT_OF_STOCK";
  }>
> {
  // Step 1: aggregate confirmed movements per variant for this tenant.
  // Inbound movement types add stock, outbound remove stock.
  const INBOUND: MovementType[] = [
    "PURCHASE",
    "RETURN_IN",
    "ADJUSTMENT_IN",
    "TRANSFER_IN",
    "INVENTORY_START",
  ];
  const OUTBOUND: MovementType[] = ["SALE", "RETURN_OUT", "ADJUSTMENT_OUT", "TRANSFER_OUT"];

  const [inbound, outbound] = await Promise.all([
    prisma.stockMovement.groupBy({
      by: ["productVariantId"],
      where: {
        status: "CONFIRMED",
        movementType: { in: INBOUND },
        productVariant: {
          tenantId,
          deletedAt: null,
          active: true,
          product: { deletedAt: null },
        },
      },
      _sum: { quantity: true },
    }),
    prisma.stockMovement.groupBy({
      by: ["productVariantId"],
      where: {
        status: "CONFIRMED",
        movementType: { in: OUTBOUND },
        productVariant: {
          tenantId,
          deletedAt: null,
          active: true,
          product: { deletedAt: null },
        },
      },
      _sum: { quantity: true },
    }),
  ]);

  // Step 2: compute net stock per variant.
  const inboundMap = new Map(inbound.map((r) => [r.productVariantId, r._sum.quantity ?? 0]));
  const outboundMap = new Map(outbound.map((r) => [r.productVariantId, r._sum.quantity ?? 0]));

  const allVariantIds = new Set([...inboundMap.keys(), ...outboundMap.keys()]);

  // Step 3: fetch variant metadata (including per-variant lowStockThreshold).
  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: [...allVariantIds] },
      tenantId,
      deletedAt: null,
      active: true,
    },
    select: {
      id: true,
      sku: true,
      variantCode: true,
      lowStockThreshold: true,
      lowStockAlertEnabled: true,
      product: {
        select: {
          reference: true,
          translations: {
            where: {
              /* no deletedAt on ProductTranslation */
            },
            orderBy: { createdAt: "asc" },
            take: 1,
            select: { name: true },
          },
        },
      },
    },
  });

  // Step 4: compute alerts, respect per-variant threshold, sort and limit.
  const alerts = variants
    .filter((v) => v.lowStockAlertEnabled)
    .map((v) => {
      const ins = inboundMap.get(v.id) ?? 0;
      const outs = outboundMap.get(v.id) ?? 0;
      const currentStock = ins - outs;
      const threshold = v.lowStockThreshold > 0 ? v.lowStockThreshold : 10;

      if (currentStock > threshold) return null;

      return {
        variantId: v.id,
        sku: v.sku,
        variantCode: v.variantCode,
        productReference: v.product!.reference,
        productName: v.product!.translations[0]?.name ?? v.product!.reference,
        currentStock,
        lowStockThreshold: threshold,
        alertType: currentStock <= 0 ? ("OUT_OF_STOCK" as const) : ("LOW_STOCK" as const),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.currentStock - b.currentStock)
    .slice(0, limit);

  return alerts;
}

/**
 * Fetch documents fulfillment status with partial tracking
 * Maps to: DOCUMENTS_FULFILLMENT widget
 */
export async function fetchDocumentsFulfillment(
  tenantId: string,
  userId: string,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<{
  totalOrders: number;
  fullyFulfilled: number;
  partiallyFulfilled: number;
  pending: number;
  fulfillmentRate: string;
  totalQuantity: number;
  deliveredQuantity: number;
}> {
  const where: Prisma.DocumentWhereInput = {
    documentType: "ORDER",
    tenantId,
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.documentDate = {};
    if (dateFrom) where.documentDate.gte = dateFrom;
    if (dateTo) where.documentDate.lte = dateTo;
  }

  const [totalOrders, fullyFulfilled, partiallyFulfilled, pending] = await Promise.all([
    prisma.document.count({ where }),

    // Fully fulfilled: all items delivered
    prisma.document.count({
      where: { ...where, status: "FULFILLED" },
    }),

    // Partially fulfilled: some items delivered
    prisma.document.count({
      where: { ...where, status: "PARTIALLY_FULFILLED" },
    }),

    // Pending: no items delivered yet
    prisma.document.count({
      where: {
        ...where,
        status: { in: ["ACCEPTED", "SENT", "PENDING_APPROVAL"] },
      },
    }),
  ]);

  // Calculate total quantities from lines
  const orderLines = await prisma.documentLine.aggregate({
    where: {
      document: where,
    },
    _sum: {
      quantity: true,
      quantityDelivered: true,
    },
  });

  const totalQuantity = parseFloat(orderLines._sum.quantity?.toString() ?? "0");
  const deliveredQuantity = parseFloat(orderLines._sum.quantityDelivered?.toString() ?? "0");

  const fulfillmentRate =
    totalQuantity > 0 ? ((deliveredQuantity / totalQuantity) * 100).toFixed(1) : "0.0";

  return {
    totalOrders,
    fullyFulfilled,
    partiallyFulfilled,
    pending,
    fulfillmentRate,
    totalQuantity,
    deliveredQuantity,
  };
}

/**
 * Fetch delivery performance metrics
 */
export async function fetchDeliveryPerformance(
  tenantId: string,
  userId: string,
  dateFrom: Date | null,
  dateTo: Date | null,
  scope: DashboardScope,
): Promise<{
  totalDeliveries: number;
  onTimeCount: number;
  delayedCount: number;
  onTimeRate: string;
  averageDeliveryTime: string;
}> {
  const where: Prisma.DocumentWhereInput = {
    documentType: "DELIVERY_NOTE",
    status: "DELIVERED",
    deliveryDate: { not: null },
    tenantId,
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.documentDate = {};
    if (dateFrom) where.documentDate.gte = dateFrom;
    if (dateTo) where.documentDate.lte = dateTo;
  }

  const deliveries = await prisma.document.findMany({
    where,
    select: {
      deliveryDate: true,
      dueDate: true,
      documentDate: true,
    },
  });

  let onTimeCount = 0;
  let delayedCount = 0;
  let totalDeliveryDays = 0;

  for (const delivery of deliveries) {
    if (delivery.deliveryDate && delivery.dueDate) {
      if (delivery.deliveryDate <= delivery.dueDate) {
        onTimeCount++;
      } else {
        delayedCount++;
      }
    }

    if (delivery.deliveryDate && delivery.documentDate) {
      const days = Math.ceil(
        (new Date(delivery.deliveryDate).getTime() - new Date(delivery.documentDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      totalDeliveryDays += days;
    }
  }

  const totalDeliveries = deliveries.length;
  const onTimeRate =
    totalDeliveries > 0 ? ((onTimeCount / totalDeliveries) * 100).toFixed(1) : "0.0";
  const averageDeliveryTime =
    totalDeliveries > 0 ? (totalDeliveryDays / totalDeliveries).toFixed(1) : "0.0";

  return {
    totalDeliveries,
    onTimeCount,
    delayedCount,
    onTimeRate,
    averageDeliveryTime,
  };
}
