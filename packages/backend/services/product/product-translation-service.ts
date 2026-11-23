import type {
  CreateProductTranslationInput,
  ProductTranslationResponse,
  UpdateProductTranslationInput,
} from "@mini-erp/shared";

import { prisma } from "../../config/prisma-config";
import { Prisma } from "../../generated/prisma/client";
import { withSoftDelete } from "../../helpers/prisma-helper";
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/app-error-utils";

const translationSelect = {
  productId: true,
  languageId: true,
  name: true,
  description: true,
  shortDescription: true,
  createdAt: true,
  updatedAt: true,
  language: {
    select: { id: true, name: true, isoCode: true },
  },
} satisfies Prisma.ProductTranslationSelect;

type TranslationRow = Prisma.ProductTranslationGetPayload<{
  select: typeof translationSelect;
}>;

function toResponse(row: TranslationRow): ProductTranslationResponse {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function visibleProductWhere(tenantId: string, productId: string): Prisma.ProductWhereInput {
  return withSoftDelete({ id: productId, tenantId });
}

function translationWhere(
  tenantId: string,
  productId: string,
  languageId: number,
): Prisma.ProductTranslationWhereUniqueInput {
  return {
    productId_languageId: { productId, languageId },
    tenantId,
    product: { is: visibleProductWhere(tenantId, productId) },
  };
}

function rethrowMissingTranslation(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    throw new NotFoundError("Traduzione prodotto non trovata");
  }

  throw error;
}

/** Lists translations for a non-deleted product in the authenticated tenant. */
export async function listProductTranslations(
  tenantId: string,
  productId: string,
): Promise<ProductTranslationResponse[]> {
  const product = await prisma.product.findFirst({
    where: visibleProductWhere(tenantId, productId),
    select: {
      translations: {
        where: { tenantId },
        orderBy: { languageId: "asc" },
        select: translationSelect,
      },
    },
  });

  if (!product) throw new NotFoundError("Prodotto non trovato");

  return product.translations.map(toResponse);
}

/** Creates one translation using the route product ID and the authenticated tenant. */
export async function createProductTranslation(
  tenantId: string,
  productId: string,
  input: CreateProductTranslationInput,
): Promise<ProductTranslationResponse> {
  try {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: visibleProductWhere(tenantId, productId),
        select: { id: true },
      });

      if (!product) throw new NotFoundError("Prodotto non trovato");

      const language = await tx.language.findUnique({
        where: { id: input.languageId },
        select: { id: true },
      });

      if (!language) throw new BadRequestError("Lingua non disponibile");

      const data = {
        tenantId,
        productId: product.id,
        languageId: language.id,
        name: input.name,
        description: input.description ?? null,
        shortDescription: input.shortDescription ?? null,
      } satisfies Prisma.ProductTranslationUncheckedCreateInput;

      const translation = await tx.productTranslation.create({
        data,
        select: translationSelect,
      });

      return toResponse(translation);
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictError("Traduzione già esistente per questa lingua");
    }

    throw error;
  }
}

/** Updates the editable fields of a translation belonging to a visible product. */
export async function updateProductTranslation(
  tenantId: string,
  productId: string,
  languageId: number,
  input: UpdateProductTranslationInput,
): Promise<ProductTranslationResponse> {
  const data = {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.shortDescription !== undefined ? { shortDescription: input.shortDescription } : {}),
  } satisfies Prisma.ProductTranslationUpdateInput;

  try {
    const translation = await prisma.productTranslation.update({
      where: translationWhere(tenantId, productId, languageId),
      data,
      select: translationSelect,
    });

    return toResponse(translation);
  } catch (error) {
    return rethrowMissingTranslation(error);
  }
}

/** Removes a translation without deleting or modifying its parent product. */
export async function deleteProductTranslation(
  tenantId: string,
  productId: string,
  languageId: number,
): Promise<void> {
  try {
    await prisma.productTranslation.delete({
      where: translationWhere(tenantId, productId, languageId),
      select: { productId: true },
    });
  } catch (error) {
    rethrowMissingTranslation(error);
  }
}
