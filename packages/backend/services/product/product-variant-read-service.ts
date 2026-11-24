import { prisma } from "@/config/prisma-config";
import { withSoftDelete } from "@/helpers/prisma-helper";
import { buildVariantSelect, toProductVariantResponse } from "@/helpers/product-variant-helper";
import { NotFoundError } from "@/utils/app-error-utils";
import { ProductVariantResponse } from "@mini-erp/shared";

/** Lists non-deleted variants belonging to a visible product in the current tenant. */
export async function listProductVariants(
  tenantId: string,
  productId: string,
): Promise<ProductVariantResponse[]> {
  const product = await prisma.product.findFirst({
    where: withSoftDelete({ id: productId, tenantId }),
    select: {
      variants: {
        where: withSoftDelete({ tenantId, productId }),
        orderBy: [{ position: "asc" }, { id: "asc" }],
        select: buildVariantSelect(tenantId),
      },
    },
  });

  if (!product) throw new NotFoundError("Prodotto non trovato");

  return product.variants.map(toProductVariantResponse);
}

/** Returns a non-deleted variant only under its visible parent product. */
export async function getProductVariant(
  tenantId: string,
  productId: string,
  variantId: string,
): Promise<ProductVariantResponse> {
  const variant = await prisma.productVariant.findFirst({
    where: {
      ...withSoftDelete({ id: variantId, tenantId, productId }),
      product: { is: withSoftDelete({ id: productId, tenantId }) },
    },
    select: buildVariantSelect(tenantId),
  });

  if (!variant) throw new NotFoundError("Variante non trovata");

  return toProductVariantResponse(variant);
}
