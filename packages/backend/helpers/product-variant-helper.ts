import { Prisma } from "@/generated/prisma/client";
import { ProductVariantResponse } from "@mini-erp/shared";
import { createHash } from "node:crypto";

/** Builds the Prisma projection for the product variant response. */
export function buildVariantSelect(tenantId: string) {
  return {
    id: true,
    productId: true,
    sku: true,
    ean13: true,
    upc: true,
    isbn: true,
    mpn: true,
    minimalQuantity: true,
    lowStockThreshold: true,
    lowStockAlertEnabled: true,
    location: true,
    availableDate: true,
    weight: true,
    width: true,
    height: true,
    depth: true,
    position: true,
    isDefault: true,
    active: true,
    availableForOrder: true,
    createdAt: true,
    updatedAt: true,
    attributes: {
      where: { tenantId },
      orderBy: [{ attributeGroupId: "asc" }, { attributeId: "asc" }],
      select: {
        attributeId: true,
        attributeGroupId: true,
        attribute: {
          select: {
            id: true,
            code: true,
            attributeGroup: { select: { id: true, code: true } },
            translations: {
              orderBy: { languageId: "asc" },
              select: { languageId: true, name: true },
            },
          },
        },
      },
    },
  } satisfies Prisma.ProductVariantSelect;
}

type ProductVariantRow = Prisma.ProductVariantGetPayload<{
  select: ReturnType<typeof buildVariantSelect>;
}>;

/** Serializes a selected product variant as the public JSON response. */
export function toProductVariantResponse(row: ProductVariantRow): ProductVariantResponse {
  return {
    ...row,
    minimalQuantity: row.minimalQuantity.toString(),
    lowStockThreshold: row.lowStockThreshold.toString(),
    availableDate: row.availableDate?.toISOString() ?? null,
    weight: row.weight?.toString() ?? null,
    width: row.width?.toString() ?? null,
    height: row.height?.toString() ?? null,
    depth: row.depth?.toString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Builds the canonical combination key from validated variant attribute IDs. */
export function buildVariantCombinationKey(attributeIds: readonly string[]): string {
  if (attributeIds.length === 0) return "default";

  return createHash("sha1")
    .update([...attributeIds].sort().join("|"))
    .digest("hex");
}
