import { prisma } from "@/config/prisma-config";
import { withSoftDelete } from "@/helpers/prisma-helper";
import { buildImageSelect, toProductImageResponse } from "@/helpers/product-image-helper";
import { NotFoundError } from "@/utils/app-error-utils";
import { ProductImageResponse } from "@mini-erp/shared";

export async function listProductImages(
  tenantId: string,
  productId: string,
): Promise<ProductImageResponse[]> {
  const product = await prisma.product.findFirst({
    where: withSoftDelete({ id: productId, tenantId }),
    select: {
      images: {
        where: {
          tenantId,
          OR: [
            { variantId: null },
            { variant: { is: withSoftDelete({ tenantId }) } },
          ],
        },
        orderBy: [{ position: "asc" }, { id: "asc" }],
        select: buildImageSelect(),
      },
    },
  });
  if (!product) throw new NotFoundError("Prodotto non trovato");

  return product.images.map(toProductImageResponse);
}
