// ============================================================================
// PRODUCTS WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { DOCUMENT_STATUSES, DOCUMENT_TYPES } from "@mini-erp/shared";

// Sale document types: stock-affecting documents excluding inbound and corrections
const SALE_DOCUMENT_TYPES = [DOCUMENT_TYPES.INVOICE, DOCUMENT_TYPES.DELIVERY_NOTE] as const;

// Statuses to exclude from revenue/performance aggregation
const EXCLUDED_STATUSES = [
  DOCUMENT_STATUSES.DRAFT,
  DOCUMENT_STATUSES.VOIDED,
  DOCUMENT_STATUSES.REJECTED,
] as const;

// Statuses considered "overdue" for invoice alerts
const OVERDUE_INVOICE_STATUSES = [
  DOCUMENT_STATUSES.UNPAID,
  DOCUMENT_STATUSES.PARTIALLY_PAID,
  DOCUMENT_STATUSES.OVERDUE,
] as const;

// ─── Stock helpers ───────────────────────────────────────────────────────────

const INBOUND_MOVEMENTS = [
  "PURCHASE",
  "RETURN_IN",
  "ADJUSTMENT_IN",
  "TRANSFER_IN",
  "INVENTORY_START",
] as const;

const OUTBOUND_MOVEMENTS = ["SALE", "RETURN_OUT", "ADJUSTMENT_OUT", "TRANSFER_OUT"] as const;

async function buildNetStockMap(tenantId: string): Promise<Map<string, number>> {
  const [inboundAgg, outboundAgg] = await Promise.all([
    prisma.stockMovement.groupBy({
      by: ["productVariantId"],
      where: {
        status: "CONFIRMED",
        movementType: { in: [...INBOUND_MOVEMENTS] },
        productVariant: { tenantId, deletedAt: null },
      },
      _sum: { quantity: true },
    }),
    prisma.stockMovement.groupBy({
      by: ["productVariantId"],
      where: {
        status: "CONFIRMED",
        movementType: { in: [...OUTBOUND_MOVEMENTS] },
        productVariant: { tenantId, deletedAt: null },
      },
      _sum: { quantity: true },
    }),
  ]);

  const map = new Map<string, number>();
  for (const r of inboundAgg) {
    map.set(r.productVariantId, r._sum.quantity ?? 0);
  }
  for (const r of outboundAgg) {
    const prev = map.get(r.productVariantId) ?? 0;
    map.set(r.productVariantId, prev - (r._sum.quantity ?? 0));
  }
  return map;
}

// ─── fetchProductsKPI ────────────────────────────────────────────────────────

export async function fetchProductsKPI(tenantId: string): Promise<{
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
  outOfStock: number;
  totalValue: string;
}> {
  const [total, active, inactive] = await Promise.all([
    prisma.product.count({ where: { tenantId, deletedAt: null } }),
    prisma.product.count({ where: { tenantId, active: true, deletedAt: null } }),
    prisma.product.count({ where: { tenantId, active: false, deletedAt: null } }),
  ]);

  const stockMap = await buildNetStockMap(tenantId);

  const variants = await prisma.productVariant.findMany({
    where: { tenantId, deletedAt: null, active: true },
    select: {
      id: true,
      lowStockThreshold: true,
      lowStockAlertEnabled: true,
      wholesalePrice: true,
    },
  });

  let lowStock = 0;
  let outOfStock = 0;
  let totalValue = 0;

  for (const v of variants) {
    const netQty = stockMap.get(v.id) ?? 0;
    const threshold = v.lowStockThreshold > 0 ? v.lowStockThreshold : 10;

    if (netQty <= 0) {
      outOfStock++;
    } else if (v.lowStockAlertEnabled && netQty <= threshold) {
      lowStock++;
    }

    if (netQty > 0) {
      const cost = parseFloat(v.wholesalePrice?.toString() ?? "0");
      totalValue += netQty * cost;
    }
  }

  const activeProducts = await prisma.product.count({
    where: { tenantId, active: true, deletedAt: null },
  });

  return {
    total,
    active,
    inactive,
    lowStock,
    outOfStock,
    totalValue: totalValue.toFixed(2),
  };
}

// ─── fetchTopSellingProducts ─────────────────────────────────────────────────

export async function fetchTopSellingProducts(
  tenantId: string,
  limit: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  preferredLanguageId: number,
): Promise<
  Array<{
    productId: string;
    productName: string;
    reference: string;
    quantitySold: number;
    revenue: string;
  }>
> {
  const documentWhere: Prisma.DocumentWhereInput = {
    tenantId,
    documentType: { in: [...SALE_DOCUMENT_TYPES] },
    status: { notIn: [...EXCLUDED_STATUSES] },
    deletedAt: null,
    ...(dateFrom || dateTo
      ? {
          documentDate: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
  };

  const result = await prisma.documentLine.groupBy({
    by: ["productId"],
    where: {
      tenantId,
      document: documentWhere,
      productId: { not: null },
    },
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  if (result.length === 0) return [];

  const productIds = result.map((r) => r.productId).filter((id): id is string => id !== null);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, tenantId, deletedAt: null },
    select: {
      id: true,
      reference: true,
      translations: {
        where: { languageId: preferredLanguageId },
        take: 1,
        select: { name: true },
      },
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  return result.map((r) => {
    const product = productMap.get(r.productId!);
    return {
      productId: r.productId!,
      productName: product?.translations[0]?.name ?? product?.reference ?? "N/A",
      reference: product?.reference ?? "N/A",
      quantitySold: parseFloat(r._sum.quantity?.toString() ?? "0"),
      revenue: r._sum.lineTotal?.toFixed(2) ?? "0.00",
    };
  });
}

// ─── fetchProductsByCategory ─────────────────────────────────────────────────

export async function fetchProductsByCategory(
  tenantId: string,
  preferredLanguageId: number,
): Promise<Array<{ categoryId: string; categoryName: string; count: number }>> {
  const result = await prisma.productCategory.groupBy({
    by: ["categoryId"],
    where: {
      product: { tenantId, deletedAt: null, active: true },
    },
    _count: { productId: true },
    orderBy: { _count: { productId: "desc" } },
    take: 10,
  });

  const categoryIds = result.map((r) => r.categoryId);

  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds }, tenantId },
    select: {
      id: true,
      translations: {
        where: { languageId: preferredLanguageId },
        take: 1,
        select: { name: true },
      },
    },
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return result.map((r) => ({
    categoryId: r.categoryId,
    categoryName: categoryMap.get(r.categoryId)?.translations[0]?.name ?? "N/A",
    count: r._count.productId,
  }));
}

// ─── fetchProductsPerformance ────────────────────────────────────────────────

export async function fetchProductsPerformance(
  tenantId: string,
  dateFrom: Date | null,
  dateTo: Date | null,
  preferredLanguageId: number,
): Promise<{
  bestPerformer: {
    productId: string;
    productName: string;
    revenue: string;
  } | null;
  worstPerformer: {
    productId: string;
    productName: string;
    revenue: string;
  } | null;
  averageRevenue: string;
}> {
  const documentWhere: Prisma.DocumentWhereInput = {
    tenantId,
    documentType: { in: [...SALE_DOCUMENT_TYPES] },
    status: { notIn: [...EXCLUDED_STATUSES] },
    deletedAt: null,
    ...(dateFrom || dateTo
      ? {
          documentDate: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
  };

  const result = await prisma.documentLine.groupBy({
    by: ["productId"],
    where: {
      tenantId,
      document: documentWhere,
      productId: { not: null },
    },
    _sum: { lineTotal: true },
    orderBy: { _sum: { lineTotal: "desc" } },
  });

  const validResults = result.filter(
    (r) => r._sum.lineTotal !== null && parseFloat(r._sum.lineTotal.toString()) > 0,
  );

  if (validResults.length === 0) {
    return { bestPerformer: null, worstPerformer: null, averageRevenue: "0.00" };
  }

  const best = validResults[0];
  const worst = validResults[validResults.length - 1];

  const totalRevenue = validResults.reduce(
    (sum, r) => sum + parseFloat(r._sum.lineTotal!.toString()),
    0,
  );
  const averageRevenue = (totalRevenue / validResults.length).toFixed(2);

  const productIds = [
    ...new Set([best.productId, worst.productId].filter((id): id is string => id !== null)),
  ];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, tenantId, deletedAt: null },
    select: {
      id: true,
      reference: true,
      translations: {
        where: { languageId: preferredLanguageId },
        take: 1,
        select: { name: true },
      },
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const formatPerformer = (row: (typeof validResults)[number]) => {
    const product = productMap.get(row.productId!);
    return {
      productId: row.productId!,
      productName: product?.translations[0]?.name ?? product?.reference ?? "N/A",
      revenue: parseFloat(row._sum.lineTotal!.toString()).toFixed(2),
    };
  };

  return {
    bestPerformer: formatPerformer(best),
    worstPerformer: formatPerformer(worst),
    averageRevenue,
  };
}
