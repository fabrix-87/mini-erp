import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { withSoftDelete } from "@/helpers/prisma-helper";
import { ProductListItemResponse, ProductQueryInput } from "@mini-erp/shared";

type ProductListResult = {
  items: ProductListItemResponse[];
  total: number;
  page: number;
  limit: number;
};

function buildProductListWhere(
  tenantId: string,
  query: ProductQueryInput,
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = withSoftDelete({ tenantId });
  const search = query.search?.trim();

  if (search) {
    where.OR = [
      { reference: { contains: search, mode: "insensitive" } },
      {
        translations: {
          some: {
            tenantId,
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  if (query.status !== undefined) where.status = query.status;
  if (query.type !== undefined) where.type = query.type;
  if (query.condition !== undefined) where.condition = query.condition;
  if (query.manufacturerId !== undefined) {
    where.manufacturerId = query.manufacturerId;
  }

  if (query.categoryId !== undefined) {
    where.categories = { some: { tenantId, categoryId: query.categoryId } };
  }

  if (query.supplierId !== undefined) {
    where.variants = {
      some: withSoftDelete({
        tenantId,
        supplierItems: {
          some: { tenantId, supplierId: query.supplierId },
        },
      }),
    };
  }

  if (query.channelId !== undefined || query.isPublished !== undefined) {
    where.channelSettings = {
      some: {
        tenantId,
        ...(query.channelId !== undefined ? { channelId: query.channelId } : {}),
        ...(query.isPublished !== undefined ? { isPublished: query.isPublished } : {}),
      },
    };
  }

  return where;
}

/** Lists non-deleted catalog products in the authenticated tenant. */
export async function listProducts(
  tenantId: string,
  query: ProductQueryInput,
): Promise<ProductListResult> {
  const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" } = query;
  const where = buildProductListWhere(tenantId, query);

  const select = {
    id: true,
    reference: true,
    type: true,
    status: true,
    condition: true,
    availableForOrder: true,
    coverThumbnailUrl: true,
    manufacturerId: true,
    manufacturer: {
      select: { id: true, name: true },
    },
    translations: {
      where: { tenantId },
      orderBy: { languageId: "asc" },
      select: { languageId: true, name: true, shortDescription: true },
    },
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.ProductSelect;

  const orderBy = [
    { [sortBy]: sortOrder },
    { id: "asc" },
  ] satisfies Prisma.ProductOrderByWithRelationInput[];

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })),
    total,
    page,
    limit,
  };
}
