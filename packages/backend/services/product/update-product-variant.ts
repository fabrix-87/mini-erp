import type { ProductVariantResponse, UpdateProductVariantInput } from "@mini-erp/shared";

import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { buildVariantSelect, toProductVariantResponse } from "@/helpers/product-variant-helper";
import {
  parseOptionalDate,
  toDecimal,
  toJsonField,
  toNullableDecimal,
  withSoftDelete,
} from "@/helpers/prisma-helper";
import { BadRequestError, ConflictError, NotFoundError } from "@/utils/app-error-utils";

function buildVariantUpdateData(input: UpdateProductVariantInput) {
  return {
    ...(input.sku !== undefined ? { sku: input.sku } : {}),
    ...(input.ean13 !== undefined ? { ean13: input.ean13 } : {}),
    ...(input.upc !== undefined ? { upc: input.upc } : {}),
    ...(input.isbn !== undefined ? { isbn: input.isbn } : {}),
    ...(input.mpn !== undefined ? { mpn: input.mpn } : {}),
    ...(input.minimalQuantity !== undefined
      ? { minimalQuantity: toDecimal(input.minimalQuantity) }
      : {}),
    ...(input.lowStockThreshold !== undefined
      ? { lowStockThreshold: toDecimal(input.lowStockThreshold) }
      : {}),
    ...(input.lowStockAlertEnabled !== undefined
      ? { lowStockAlertEnabled: input.lowStockAlertEnabled }
      : {}),
    ...(input.location !== undefined ? { location: input.location } : {}),
    ...(input.availableDate !== undefined
      ? { availableDate: parseOptionalDate(input.availableDate) }
      : {}),
    ...(input.weight !== undefined ? { weight: toNullableDecimal(input.weight) } : {}),
    ...(input.width !== undefined ? { width: toNullableDecimal(input.width) } : {}),
    ...(input.height !== undefined ? { height: toNullableDecimal(input.height) } : {}),
    ...(input.depth !== undefined ? { depth: toNullableDecimal(input.depth) } : {}),
    ...(input.position !== undefined ? { position: input.position } : {}),
    ...(input.active !== undefined ? { active: input.active } : {}),
    ...(input.availableForOrder !== undefined
      ? { availableForOrder: input.availableForOrder }
      : {}),
    ...(input.metadata !== undefined ? { metadata: toJsonField(input.metadata) } : {}),
  } satisfies Prisma.ProductVariantUpdateInput;
}

/**
 * Updates editable variant fields without changing the attribute combination
 * or allowing the current default variant to become inactive.
 */
export async function updateProductVariant(
  tenantId: string,
  productId: string,
  variantId: string,
  input: UpdateProductVariantInput,
): Promise<ProductVariantResponse> {
  const data = buildVariantUpdateData(input);

  if (Object.keys(data).length === 0) {
    throw new BadRequestError("Indica almeno un campo da aggiornare");
  }

  const variantScope = withSoftDelete({ tenantId, productId });
  const productScope = withSoftDelete({ id: productId, tenantId });

  const where = {
    ...variantScope,
    id: variantId,
    product: {
      is: {
        ...productScope,
        status: { in: ["DRAFT", "ACTIVE"] },
      },
    },
    ...(input.active === false ? { isDefault: false } : {}),
  } satisfies Prisma.ProductVariantWhereUniqueInput;

  try {
    const updated = await prisma.productVariant.update({
      where,
      data,
      select: buildVariantSelect(tenantId),
    });

    return toProductVariantResponse(updated);
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) throw error;

    if (error.code === "P2002") {
      throw new ConflictError("SKU o EAN-13 già in uso");
    }

    if (error.code !== "P2025") throw error;

    // Diagnose the rejected update without widening the tenant or parent scope.
    const current = await prisma.productVariant.findFirst({
      where: {
        ...variantScope,
        id: variantId,
        product: { is: productScope },
      },
      select: {
        isDefault: true,
        product: { select: { status: true } },
      },
    });

    if (!current) throw new NotFoundError("Variante non trovata");

    if (current.product.status === "ARCHIVED") {
      throw new ConflictError("Non puoi modificare una variante di un prodotto archiviato");
    }

    if (input.active === false && current.isDefault) {
      throw new ConflictError("Non puoi disattivare la variante predefinita");
    }

    throw new ConflictError("La variante o il prodotto sono cambiati. Riprova.");
  }
}
