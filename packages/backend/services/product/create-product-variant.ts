import type { CreateProductVariantInput, ProductVariantResponse } from "@mini-erp/shared";

import { prisma } from "../../config/prisma-config";
import { Prisma } from "../../generated/prisma/client";
import {
  parseOptionalDate,
  toDecimal,
  toJsonField,
  withSoftDelete,
} from "../../helpers/prisma-helper";
import {
  buildVariantCombinationKey,
  buildVariantSelect,
  toProductVariantResponse,
} from "../../helpers/product-variant-helper";
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/app-error-utils";

/**
 * Creates a non-default variant for a product's existing axes.
 * Persists the variant and its attribute links in the same transaction.
 */
export async function createProductVariant(
  tenantId: string,
  productId: string,
  input: CreateProductVariantInput,
): Promise<ProductVariantResponse> {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const product = await tx.product.findFirst({
          where: withSoftDelete({ id: productId, tenantId }),
          select: {
            status: true,
            variantAxes: {
              where: { tenantId },
              select: { attributeGroupId: true },
            },
          },
        });

        if (!product) throw new NotFoundError("Prodotto non trovato");

        if (product.status === "ARCHIVED") {
          throw new ConflictError("Non puoi aggiungere varianti a un prodotto archiviato");
        }

        const axisIds = new Set(
          product.variantAxes.map(({ attributeGroupId }) => attributeGroupId),
        );

        if (axisIds.size === 0) {
          throw new ConflictError("Non puoi aggiungere una variante a un prodotto senza assi");
        }

        const attributeIds = new Set(input.attributeIds);

        if (input.attributeIds.length !== axisIds.size || attributeIds.size !== axisIds.size) {
          throw new BadRequestError("Indica un solo valore di attributo per ciascun asse");
        }

        const attributes = await tx.attribute.findMany({
          where: { tenantId, id: { in: [...attributeIds] } },
          select: { id: true, attributeGroupId: true },
        });

        const usedAxes = new Set(attributes.map(({ attributeGroupId }) => attributeGroupId));

        if (
          attributes.length !== axisIds.size ||
          usedAxes.size !== axisIds.size ||
          [...usedAxes].some((axisId) => !axisIds.has(axisId))
        ) {
          throw new BadRequestError(
            "I valori devono appartenere al tenant e coprire esattamente gli assi del prodotto",
          );
        }

        const combinationKey = buildVariantCombinationKey([...attributeIds]);

        // Include soft-deleted variants to reserve historical combinations.
        const existing = await tx.productVariant.findFirst({
          where: withSoftDelete({ tenantId, productId, combinationKey }, true),
          select: { id: true },
        });

        if (existing) {
          throw new ConflictError("Esiste già una variante per questa combinazione");
        }

        const data = {
          tenantId,
          productId,
          combinationKey,
          sku: input.sku,
          ean13: input.ean13 ?? null,
          upc: input.upc ?? null,
          isbn: input.isbn ?? null,
          mpn: input.mpn ?? null,
          minimalQuantity: toDecimal(input.minimalQuantity),
          lowStockThreshold: toDecimal(input.lowStockThreshold),
          lowStockAlertEnabled: input.lowStockAlertEnabled,
          location: input.location ?? null,
          availableDate: parseOptionalDate(input.availableDate) ?? null,
          weight: input.weight == null ? null : toDecimal(input.weight),
          width: input.width == null ? null : toDecimal(input.width),
          height: input.height == null ? null : toDecimal(input.height),
          depth: input.depth == null ? null : toDecimal(input.depth),
          position: input.position,
          isDefault: false,
          active: input.active,
          availableForOrder: input.availableForOrder,
          ...(input.metadata === undefined ? {} : { metadata: toJsonField(input.metadata) }),
        } satisfies Prisma.ProductVariantUncheckedCreateInput;

        const variant = await tx.productVariant.create({
          data,
          select: { id: true },
        });

        const links = attributes.map(({ id, attributeGroupId }) => ({
          tenantId,
          productId,
          productVariantId: variant.id,
          attributeGroupId,
          attributeId: id,
        })) satisfies Prisma.ProductVariantAttributeCreateManyInput[];

        await tx.productVariantAttribute.createMany({ data: links });

        const created = await tx.productVariant.findFirstOrThrow({
          where: withSoftDelete({ id: variant.id, tenantId, productId }),
          select: buildVariantSelect(tenantId),
        });

        return toProductVariantResponse(created);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictError("SKU, EAN-13 o combinazione già in uso");
      }

      if (error.code === "P2003" || error.code === "P2034") {
        throw new ConflictError(
          "Il prodotto o i suoi attributi sono cambiati durante l'operazione. Riprova.",
        );
      }
    }

    throw error;
  }
}
