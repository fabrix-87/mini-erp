import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { withSoftDelete } from "@/helpers/prisma-helper";
import { ConflictError, NotFoundError } from "@/utils/app-error-utils";

/** Soft-deletes a product and its remaining variants when no historical references exist. */
export async function deleteProduct(
  tenantId: string,
  productId: string,
  deletedBy: string,
): Promise<void> {
  const productWhere = {
    ...withSoftDelete({ tenantId }),
    id: productId,
  } satisfies Prisma.ProductWhereUniqueInput;

  try {
    await prisma.$transaction(
      async (tx) => {
        const product = await tx.product.findUnique({
          where: productWhere,
          select: { id: true },
        });

        if (!product) throw new NotFoundError("Prodotto non trovato");

        // Historical lookups must also match previously deleted variants.
        const variantWhere = {
          tenantId,
          productId,
        } satisfies Prisma.ProductVariantWhereInput;

        const documentLine = await tx.documentLine.findFirst({
          where: {
            tenantId,
            OR: [{ productId }, { productVariant: { is: variantWhere } }],
          },
          select: { id: true },
        });

        if (documentLine) {
          throw new ConflictError(
            "Il prodotto è presente in documenti e non può essere cancellato",
          );
        }

        const movement = await tx.stockMovement.findFirst({
          where: {
            tenantId,
            productVariant: { is: variantWhere },
          },
          select: { id: true },
        });

        if (movement) {
          throw new ConflictError(
            "Il prodotto ha movimenti di magazzino e non può essere cancellato",
          );
        }

        const deletion = {
          deletedAt: new Date(),
          deletedBy,
        } satisfies Prisma.ProductUncheckedUpdateInput;

        await tx.product.update({
          where: productWhere,
          data: deletion,
          select: { id: true },
        });

        await tx.productVariant.updateMany({
          where: withSoftDelete({ tenantId, productId }),
          data: deletion,
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new NotFoundError("Prodotto non trovato");
      }

      if (error.code === "P2034") {
        throw new ConflictError("Il prodotto è coinvolto in un'operazione concorrente. Riprova.");
      }
    }

    throw error;
  }
}
