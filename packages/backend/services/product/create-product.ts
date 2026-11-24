import type { CreateProductInput, CreateProductResponse } from "@mini-erp/shared";

import { prisma } from "../../config/prisma-config";
import { Prisma } from "../../generated/prisma/client";
import { parseOptionalDate, toDecimal, toJsonField } from "../../helpers/prisma-helper";
import { BadRequestError, ConflictError } from "../../utils/app-error-utils";
import { buildVariantCombinationKey } from "@/helpers/product-variant-helper";

/**
 * Creates a product, its axes, and its initial variants atomically.
 * Expects a parsed createProductSchema payload and an authenticated tenant scope.
 */
export async function createProductAggregate(
  tenantId: string,
  input: CreateProductInput,
): Promise<CreateProductResponse> {
  // Keep the invariant here as well, so non-HTTP callers cannot bypass it.
  const defaultCount = input.variants.filter((variant) => variant.isDefault).length;
  const defaultIndex =
    input.variants.length === 1 ? 0 : input.variants.findIndex((variant) => variant.isDefault);

  if (
    input.variants.length === 0 ||
    (input.variants.length > 1 && defaultCount !== 1) ||
    input.variants[defaultIndex]?.active !== true
  ) {
    throw new BadRequestError("Il prodotto deve avere una sola variante predefinita attiva");
  }

  const axisIds = input.axes.map((axis) => axis.attributeGroupId);
  const axisSet = new Set(axisIds);

  if (axisSet.size !== axisIds.length || (axisIds.length === 0 && input.variants.length > 1)) {
    throw new BadRequestError("Configurazione degli assi variante non valida");
  }

  const attributeIds = [...new Set(input.variants.flatMap((variant) => variant.attributeIds))];

  try {
    return await prisma.$transaction(async (tx): Promise<CreateProductResponse> => {
      const [baseUom, manufacturer, taxRule, commodity, groups, attributes] = await Promise.all([
        tx.unitOfMeasure.findFirst({
          where: { id: input.baseUomId, tenantId, active: true },
          select: { id: true },
        }),
        input.manufacturerId == null
          ? null
          : tx.manufacturer.findFirst({
              where: { id: input.manufacturerId, tenantId },
              select: { id: true },
            }),
        input.defaultTaxRuleId == null
          ? null
          : tx.taxRule.findFirst({
              where: {
                id: input.defaultTaxRuleId,
                OR: [{ tenantId }, { tenantId: null }],
              },
              select: { id: true },
            }),
        input.commodityCode == null
          ? null
          : tx.intrastatCommodityCode.findUnique({
              where: { code: input.commodityCode },
              select: { code: true },
            }),
        axisIds.length === 0
          ? []
          : tx.attributeGroup.findMany({
              where: { tenantId, id: { in: axisIds } },
              select: { id: true },
            }),
        attributeIds.length === 0
          ? []
          : tx.attribute.findMany({
              where: { tenantId, id: { in: attributeIds } },
              select: { id: true, attributeGroupId: true },
            }),
      ]);

      if (!baseUom) throw new BadRequestError("Unità di misura base non disponibile");
      if (input.manufacturerId != null && !manufacturer) {
        throw new BadRequestError("Produttore non disponibile");
      }
      if (input.defaultTaxRuleId != null && !taxRule) {
        throw new BadRequestError("Regola fiscale non disponibile");
      }
      if (input.commodityCode != null && !commodity) {
        throw new BadRequestError("Codice NC8 non disponibile");
      }
      if (groups.length !== axisIds.length || attributes.length !== attributeIds.length) {
        throw new BadRequestError("Uno o più gruppi o valori di attributo non sono disponibili");
      }

      const attributesById = new Map(attributes.map((attribute) => [attribute.id, attribute]));
      const seenSkus = new Set<string>();
      const seenEans = new Set<string>();
      const seenCombinations = new Set<string>();

      const variants = input.variants.map((variant, index) => {
        if (seenSkus.has(variant.sku)) {
          throw new BadRequestError("Lo stesso SKU compare in più varianti");
        }
        seenSkus.add(variant.sku);

        if (variant.ean13 != null) {
          if (seenEans.has(variant.ean13)) {
            throw new BadRequestError("Lo stesso EAN-13 compare in più varianti");
          }
          seenEans.add(variant.ean13);
        }

        const usedGroups = new Set<string>();
        const values = variant.attributeIds.map((id) => {
          const attribute = attributesById.get(id);
          if (
            !attribute ||
            !axisSet.has(attribute.attributeGroupId) ||
            usedGroups.has(attribute.attributeGroupId)
          ) {
            throw new BadRequestError(
              `La variante «${variant.sku}» deve avere un valore per ogni asse dichiarato`,
            );
          }
          usedGroups.add(attribute.attributeGroupId);
          return attribute;
        });

        if (usedGroups.size !== axisSet.size) {
          throw new BadRequestError(
            `La variante «${variant.sku}» deve avere un valore per ogni asse dichiarato`,
          );
        }

        const combinationKey = buildVariantCombinationKey(values.map(({ id }) => id));

        if (seenCombinations.has(combinationKey)) {
          throw new BadRequestError("Più varianti hanno la stessa combinazione di attributi");
        }
        seenCombinations.add(combinationKey);

        return { variant, values, combinationKey, isDefault: index === defaultIndex };
      });

      const productData = {
        tenantId,
        reference: input.reference,
        type: input.type,
        status: "DRAFT",
        availableForOrder: input.availableForOrder,
        ecotax: toDecimal(input.ecotax),
        packStockType: input.packStockType,
        outOfStockType: input.outOfStockType,
        baseUomId: baseUom.id,
        defaultTaxRuleId: taxRule?.id ?? null,
        condition: input.condition,
        manufacturerId: manufacturer?.id ?? null,
        commodityCode: commodity?.code ?? null,
        coverThumbnailUrl: input.coverThumbnailUrl ?? null,
      } satisfies Prisma.ProductUncheckedCreateInput;

      const product = await tx.product.create({
        data: productData,
        select: {
          id: true,
          reference: true,
          type: true,
          status: true,
          baseUomId: true,
          ecotax: true,
          createdAt: true,
        },
      });

      if (input.axes.length > 0) {
        const axes = input.axes.map((axis) => ({
          tenantId,
          productId: product.id,
          attributeGroupId: axis.attributeGroupId,
          position: axis.position,
        })) satisfies Prisma.ProductVariantAxisCreateManyInput[];

        await tx.productVariantAxis.createMany({ data: axes });
      }

      const createdVariants: CreateProductResponse["variants"] = [];
      const links: Prisma.ProductVariantAttributeCreateManyInput[] = [];

      for (const { variant, values, combinationKey, isDefault } of variants) {
        const variantData = {
          tenantId,
          productId: product.id,
          combinationKey,
          sku: variant.sku,
          ean13: variant.ean13 ?? null,
          upc: variant.upc ?? null,
          isbn: variant.isbn ?? null,
          mpn: variant.mpn ?? null,
          minimalQuantity: toDecimal(variant.minimalQuantity),
          lowStockThreshold: toDecimal(variant.lowStockThreshold),
          lowStockAlertEnabled: variant.lowStockAlertEnabled,
          location: variant.location ?? null,
          availableDate: parseOptionalDate(variant.availableDate) ?? null,
          weight: variant.weight == null ? null : toDecimal(variant.weight),
          width: variant.width == null ? null : toDecimal(variant.width),
          height: variant.height == null ? null : toDecimal(variant.height),
          depth: variant.depth == null ? null : toDecimal(variant.depth),
          position: variant.position,
          isDefault,
          active: variant.active,
          availableForOrder: variant.availableForOrder,
          ...(variant.metadata === undefined ? {} : { metadata: toJsonField(variant.metadata) }),
        } satisfies Prisma.ProductVariantUncheckedCreateInput;

        const created = await tx.productVariant.create({
          data: variantData,
          select: { id: true, sku: true, position: true, isDefault: true, active: true },
        });

        createdVariants.push({ ...created, attributeIds: values.map(({ id }) => id) });
        for (const value of values) {
          links.push({
            tenantId,
            productId: product.id,
            productVariantId: created.id,
            attributeGroupId: value.attributeGroupId,
            attributeId: value.id,
          });
        }
      }

      if (links.length > 0) {
        await tx.productVariantAttribute.createMany({ data: links });
      }

      return {
        ...product,
        ecotax: product.ecotax.toString(),
        createdAt: product.createdAt.toISOString(),
        variants: createdVariants,
      };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictError("Riferimento prodotto, SKU, EAN-13 o combinazione già in uso");
    }
    throw error;
  }
}
