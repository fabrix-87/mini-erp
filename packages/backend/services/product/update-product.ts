import { Prisma } from "@/generated/prisma/client";
import { BadRequestError, ConflictError, NotFoundError } from "@/utils/app-error-utils";
import { ProductDetailResponse, toDecimal, UpdateProductInput } from "@mini-erp/shared";
import { getProductDetail } from "./get-product-detail";
import { prisma } from "@/config/prisma-config";
import { withSoftDelete } from "@/helpers/prisma-helper";

function buildProductUpdateData(input: UpdateProductInput): Prisma.ProductUncheckedUpdateInput {
  const ecotax = toDecimal(input.ecotax);

  return {
    ...(input.reference !== undefined ? { reference: input.reference } : {}),
    ...(input.availableForOrder !== undefined
      ? { availableForOrder: input.availableForOrder }
      : {}),
    ...(ecotax !== undefined ? { ecotax } : {}),
    ...(input.packStockType !== undefined ? { packStockType: input.packStockType } : {}),
    ...(input.outOfStockType !== undefined ? { outOfStockType: input.outOfStockType } : {}),
    ...(input.defaultTaxRuleId !== undefined ? { defaultTaxRuleId: input.defaultTaxRuleId } : {}),
    ...(input.condition !== undefined ? { condition: input.condition } : {}),
    ...(input.manufacturerId !== undefined ? { manufacturerId: input.manufacturerId } : {}),
    ...(input.commodityCode !== undefined ? { commodityCode: input.commodityCode } : {}),
    ...(input.coverThumbnailUrl !== undefined
      ? { coverThumbnailUrl: input.coverThumbnailUrl }
      : {}),
  } satisfies Prisma.ProductUncheckedUpdateInput;
}

async function validateProductUpdateReferences(
  tx: Prisma.TransactionClient,
  tenantId: string,
  input: UpdateProductInput,
): Promise<void> {
  if (input.manufacturerId != null) {
    const manufacturer = await tx.manufacturer.findFirst({
      where: { id: input.manufacturerId, tenantId },
      select: { id: true },
    });

    if (!manufacturer) throw new BadRequestError("Produttore non disponibile");
  }

  if (input.defaultTaxRuleId != null) {
    const taxRule = await tx.taxRule.findFirst({
      where: {
        id: input.defaultTaxRuleId,
        OR: [{ tenantId }, { tenantId: null }],
      },
      select: { id: true },
    });

    if (!taxRule) throw new BadRequestError("Regola fiscale non disponibile");
  }

  if (input.commodityCode != null) {
    const commodity = await tx.intrastatCommodityCode.findUnique({
      where: { code: input.commodityCode },
      select: { code: true },
    });

    if (!commodity) throw new BadRequestError("Codice NC8 non disponibile");
  }
}

/** Updates editable master fields and returns the updated tenant-scoped detail. */
export async function updateProduct(
  tenantId: string,
  productId: string,
  input: UpdateProductInput,
): Promise<ProductDetailResponse> {
  const data = buildProductUpdateData(input);

  if (Object.keys(data).length === 0) {
    throw new BadRequestError("Indica almeno un campo da aggiornare");
  }

  const where = {
    ...withSoftDelete({ tenantId }),
    id: productId,
  } satisfies Prisma.ProductWhereUniqueInput;

  try {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where,
        select: { id: true },
      });

      if (!product) throw new NotFoundError("Prodotto non trovato");

      await validateProductUpdateReferences(tx, tenantId, input);

      await tx.product.update({
        where,
        data,
        select: { id: true },
      });

      return getProductDetail(tenantId, productId, tx);
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new NotFoundError("Prodotto non trovato");
      }
      if (error.code === "P2002") {
        throw new ConflictError("Riferimento prodotto già esistente");
      }
      if (error.code === "P2003") {
        throw new ConflictError("Uno dei riferimenti del prodotto non è più disponibile");
      }
    }

    throw error;
  }
}
