// ============================================================================
// PRODUCTS WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

/**
 * Fetch products KPI
 */
export async function fetchProductsKPI(): Promise<{
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
  outOfStock: number;
  totalValue: string;
}> {
  const [total, active, inactive] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { active: true, deletedAt: null } }),
    prisma.product.count({ where: { active: false, deletedAt: null } }),
  ]);

  const [lowStock, outOfStock] = await Promise.all([
    prisma.productVariant.count({
      where: { quantity: { gt: 0, lte: 10 }, deletedAt: null },
    }),
    prisma.productVariant.count({
      where: { quantity: 0, deletedAt: null },
    }),
  ]);

  const variants = await prisma.productVariant.findMany({
    where: { deletedAt: null },
    select: { quantity: true, price: true },
  });

  const totalValue = variants.reduce((sum, v) => {
    return sum + parseFloat(v.quantity.toString()) * parseFloat(v.price?.toString() ?? "0");
  }, 0);

  return {
    total,
    active,
    inactive,
    lowStock,
    outOfStock,
    totalValue: totalValue.toFixed(2),
  };
}

/**
 * Fetch top selling products
 */
export async function fetchTopSellingProducts(
  limit: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  preferredLanguageId: number,
): Promise<
  Array<{
    productId: number;
    productName: string;
    reference: string;
    quantitySold: number | Decimal;
    revenue: string;
  }>
> {
  const documentWhere: Prisma.DocumentWhereInput = {
    status: { notIn: ["DRAFT", "VOIDED"] },
  };

  if (dateFrom || dateTo) {
    documentWhere.documentDate = {};
    if (dateFrom) documentWhere.documentDate.gte = dateFrom;
    if (dateTo) documentWhere.documentDate.lte = dateTo;
  }

  const result = await prisma.documentLine.groupBy({
    by: ["productId"],
    where: {
      document: documentWhere,
      productId: { not: null },
    },
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  if (result.length === 0) return [];

  const productIds = result.map((r) => r.productId).filter((id): id is number => id !== null);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      reference: true,
      translations: {
        where: { languageId: preferredLanguageId },
        select: { name: true },
        take: 1,
      },
    },
  });

  return result.map((r) => {
    const product = products.find((p) => p.id === r.productId);
    return {
      productId: r.productId!,
      productName: product?.translations[0]?.name ?? product?.reference ?? "N/A",
      reference: product?.reference ?? "N/A",
      quantitySold: r._sum.quantity ?? 0,
      revenue: r._sum.lineTotal?.toString() ?? "0",
    };
  });
}

/**
 * Fetch products by category distribution
 */
export async function fetchProductsByCategory(): Promise<
  Array<{ categoryName: string; count: number }>
> {
  const result = await prisma.productCategory.groupBy({
    by: ["categoryId"],
    _count: { productId: true },
    orderBy: { _count: { productId: "desc" } },
    take: 10,
  });

  const categoryIds = result.map((r) => r.categoryId);

  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: {
      id: true,
      translations: {
        take: 1,
        select: { name: true },
      },
    },
  });

  return result.map((r) => {
    const category = categories.find((c) => c.id === r.categoryId);
    return {
      categoryName: category?.translations[0]?.name ?? "N/A",
      count: r._count.productId,
    };
  });
}

/**
 * Fetch product performance metrics
 */
export async function fetchProductsPerformance(
  dateFrom: Date | null,
  dateTo: Date | null,
): Promise<{
  bestPerformer: { productId: number; productName: string; revenue: string } | null;
  worstPerformer: { productId: number; productName: string; revenue: string } | null;
  averageRevenue: string;
}> {
  const documentWhere: Prisma.DocumentWhereInput = {
    status: { notIn: ["DRAFT", "VOIDED"] },
  };

  if (dateFrom || dateTo) {
    documentWhere.documentDate = {};
    if (dateFrom) documentWhere.documentDate.gte = dateFrom;
    if (dateTo) documentWhere.documentDate.lte = dateTo;
  }

  const result = await prisma.documentLine.groupBy({
    by: ["productId"],
    where: {
      document: documentWhere,
      productId: { not: null },
    },
    _sum: { lineTotal: true },
    orderBy: { _sum: { lineTotal: "desc" } },
  });

  if (result.length === 0) {
    return {
      bestPerformer: null,
      worstPerformer: null,
      averageRevenue: "0.00",
    };
  }

  const best = result[0];
  const worst = result[result.length - 1];

  const totalRevenue = result.reduce(
    (sum, r) => sum + parseFloat(r._sum.lineTotal?.toString() ?? "0"),
    0,
  );
  const averageRevenue = (totalRevenue / result.length).toFixed(2);

  // Fetch product details
  const productIds = [best.productId, worst.productId].filter(
    (id): id is number => id !== null,
  );
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      reference: true,
      translations: { take: 1, select: { name: true } },
    },
  });

  const bestProduct = products.find((p) => p.id === best.productId);
  const worstProduct = products.find((p) => p.id === worst.productId);

  return {
    bestPerformer: {
      productId: best.productId!,
      productName: bestProduct?.translations[0]?.name ?? bestProduct?.reference ?? "N/A",
      revenue: best._sum.lineTotal?.toString() ?? "0",
    },
    worstPerformer: {
      productId: worst.productId!,
      productName: worstProduct?.translations[0]?.name ?? worstProduct?.reference ?? "N/A",
      revenue: worst._sum.lineTotal?.toString() ?? "0",
    },
    averageRevenue,
  };
}
