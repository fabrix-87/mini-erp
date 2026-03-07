// ============================================================================
// LOGISTICS WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-client";
import { Prisma } from "@/generated/prisma/client";
import { DashboardScope } from "@mini-erp/shared";

/**
 * Fetch deliveries KPI
 */
export async function fetchDeliveriesKPI(
  userId: number,
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
 * Fetch stock alerts (low stock + out of stock)
 */
export async function fetchStockAlerts(limit: number): Promise<
  Array<{
    variantId: number;
    variantCode: string;
    productReference: string;
    productName: string;
    currentStock: number;
    alertType: "LOW_STOCK" | "OUT_OF_STOCK";
  }>
> {
  const lowStockVariants = await prisma.productVariant.findMany({
    where: {
      quantity: { lte: 10 },
      deletedAt: null,
      active: true,
    },
    take: limit,
    orderBy: { quantity: "asc" },
    select: {
      id: true,
      variantCode: true,
      quantity: true,
      product: {
        select: {
          reference: true,
          translations: {
            take: 1,
            select: { name: true },
          },
        },
      },
    },
  });

  return lowStockVariants.map((v) => ({
    variantId: v.id,
    variantCode: v.variantCode,
    productReference: v.product!.reference,
    productName: v.product!.translations[0]?.name ?? v.product!.reference,
    currentStock: v.quantity,
    alertType: v.quantity === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
  }));
}

/**
 * Fetch documents fulfillment status with partial tracking
 * Maps to: DOCUMENTS_FULFILLMENT widget
 */
export async function fetchDocumentsFulfillment(
  userId: number,
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
  };

  if (scope === DashboardScope.OWN) {
    where.assignedUserId = userId;
  }

  if (dateFrom || dateTo) {
    where.documentDate = {};
    if (dateFrom) where.documentDate.gte = dateFrom;
    if (dateTo) where.documentDate.lte = dateTo;
  }

  const [totalOrders, fullyFulfilled, partiallyFulfilled, pending] =
    await Promise.all([
      prisma.document.count({ where }),
      
      // Fully fulfilled: all items delivered
      prisma.document.count({ 
        where: { ...where, status: "FULFILLED" } 
      }),
      
      // Partially fulfilled: some items delivered
      prisma.document.count({
        where: { ...where, status: "PARTIALLY_FULFILLED" },
      }),
      
      // Pending: no items delivered yet
      prisma.document.count({ 
        where: { 
          ...where, 
          status: { in: ["ACCEPTED", "SENT", "PENDING_APPROVAL"] } 
        } 
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
  const deliveredQuantity = parseFloat(
    orderLines._sum.quantityDelivered?.toString() ?? "0",
  );

  const fulfillmentRate =
    totalQuantity > 0
      ? ((deliveredQuantity / totalQuantity) * 100).toFixed(1)
      : "0.0";

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
  userId: number,
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
        (new Date(delivery.deliveryDate).getTime() -
          new Date(delivery.documentDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      totalDeliveryDays += days;
    }
  }

  const totalDeliveries = deliveries.length;
  const onTimeRate =
    totalDeliveries > 0 ? ((onTimeCount / totalDeliveries) * 100).toFixed(1) : "0.0";
  const averageDeliveryTime =
    totalDeliveries > 0
      ? (totalDeliveryDays / totalDeliveries).toFixed(1)
      : "0.0";

  return {
    totalDeliveries,
    onTimeCount,
    delayedCount,
    onTimeRate,
    averageDeliveryTime,
  };
}
