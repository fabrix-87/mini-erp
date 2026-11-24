import { Prisma } from "@/generated/prisma/client";
import { ProductImageResponse } from "@mini-erp/shared";

/** Builds the Prisma projection for the product image response. */
export function buildImageSelect() {
  return {
    id: true,
    productId: true,
    variantId: true,
    imageUrl: true,
    imageType: true,
    position: true,
    isCover: true,
    width: true,
    height: true,
    fileSize: true,
    mimeType: true,
    createdAt: true,
    updatedAt: true,
    translations: {
      select: {
        description: true,
        languageId: true,
      },
    },
  } satisfies Prisma.ProductImageSelect;
}

type ProductImageRow = Prisma.ProductImageGetPayload<{
  select: ReturnType<typeof buildImageSelect>;
}>;

/** Serializes a selected product variant as the public JSON response. */
export function toProductImageResponse(row: ProductImageRow): ProductImageResponse {
  return {
    ...row,
    width: row.width?.toString() ?? null,
    height: row.height?.toString() ?? null,
    fileSize: row.fileSize?.toString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
