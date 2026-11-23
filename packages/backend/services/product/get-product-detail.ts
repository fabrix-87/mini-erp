import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { withSoftDelete } from "@/helpers/prisma-helper";
import { NotFoundError } from "@/utils/app-error-utils";
import { ProductDetailResponse } from "@mini-erp/shared";

/** Returns a tenant-scoped product detail without soft-deleted catalog records. */
export async function getProductDetail(
  tenantId: string,
  productId: string,
): Promise<ProductDetailResponse> {
  const select = {
    id: true,
    reference: true,
    type: true,
    status: true,
    condition: true,
    availableForOrder: true,
    baseUomId: true,
    ecotax: true,
    coverThumbnailUrl: true,
    defaultTaxRuleId: true,
    manufacturerId: true,
    createdAt: true,
    updatedAt: true,
    manufacturer: { select: { id: true, name: true } },
    translations: {
      where: { tenantId },
      orderBy: { languageId: "asc" },
      select: {
        languageId: true,
        name: true,
        description: true,
        shortDescription: true,
      },
    },
    variants: {
      where: withSoftDelete({ tenantId }),
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: {
        id: true,
        sku: true,
        ean13: true,
        weight: true,
        width: true,
        height: true,
        depth: true,
        isDefault: true,
        active: true,
        attributes: {
          where: { tenantId },
          select: {
            attributeGroupId: true,
            attributeId: true,
            attribute: {
              select: {
                id: true,
                code: true,
                attributeGroup: { select: { id: true, code: true } },
                translations: {
                  select: { languageId: true, name: true },
                },
              },
            },
          },
        },
      },
    },
    images: {
      where: {
        tenantId,
        OR: [
          { variantId: null },
          { variant: { is: withSoftDelete({ tenantId }) } },
        ],
      },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: {
        id: true,
        imageUrl: true,
        imageType: true,
        position: true,
        isCover: true,
      },
    },
    categories: {
      where: { tenantId },
      orderBy: [{ position: "asc" }, { categoryId: "asc" }],
      select: {
        categoryId: true,
        position: true,
        category: { select: { id: true } },
      },
    },
  } satisfies Prisma.ProductSelect;

  const product = await prisma.product.findFirst({
    where: withSoftDelete({ id: productId, tenantId }),
    select,
  });

  if (!product) throw new NotFoundError("Prodotto non trovato");

  return {
    ...product,
    ecotax: product.ecotax.toString(),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    variants: product.variants.map((variant) => ({
      ...variant,
      weight: variant.weight?.toString() ?? null,
      width: variant.width?.toString() ?? null,
      height: variant.height?.toString() ?? null,
      depth: variant.depth?.toString() ?? null,
    })),
  };
}