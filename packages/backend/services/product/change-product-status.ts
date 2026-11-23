import { Prisma } from "@/generated/prisma/client";
import { withSoftDelete } from "@/helpers/prisma-helper";
import { ConflictError, NotFoundError } from "@/utils/app-error-utils";
import { ProductDetailResponse } from "@mini-erp/shared";
import { getProductDetail } from "./get-product-detail";
import { prisma } from "@/config/prisma-config";

type ProductLifecycleAction = "activate" | "archive";

/** Applies an allowed product lifecycle transition and returns the updated detail. */
export async function changeProductStatus(
  tenantId: string,
  productId: string,
  action: ProductLifecycleAction,
): Promise<ProductDetailResponse> {
  const scope: Prisma.ProductWhereInput = withSoftDelete({
    id: productId,
    tenantId,
  });

  const activating = action === "activate";
  const status = activating ? "ACTIVE" : "ARCHIVED";

  return prisma.$transaction(async (tx) => {
    const result = await tx.product.updateMany({
      where: {
        ...scope,
        ...(activating
          ? {
              status: { in: ["DRAFT", "ARCHIVED"] },
              variants: {
                some: withSoftDelete({ tenantId, isDefault: true, active: true }),
                none: withSoftDelete({ tenantId, isDefault: true, active: false }),
              },
            }
          : { status: "ACTIVE" }),
      },
      data: { status },
    });

    if (result.count === 0) {
      const product = await tx.product.findFirst({
        where: scope,
        select: { status: true },
      });

      if (!product) throw new NotFoundError("Prodotto non trovato");

      if (activating && (product.status === "DRAFT" || product.status === "ARCHIVED")) {
        throw new ConflictError("Il prodotto non ha una variante predefinita attiva");
      }

      throw new ConflictError("Transizione non consentita per lo stato corrente del prodotto");
    }

    return getProductDetail(tenantId, productId, tx);
  });
}
