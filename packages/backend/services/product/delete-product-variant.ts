import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { withSoftDelete } from "@/helpers/prisma-helper";
import { ConflictError, NotFoundError } from "@/utils/app-error-utils";

/**
 * Soft-deletes an unused variant and promotes an active replacement if needed.
 * Records the authenticated actor and preserves the variant's attribute links.
 */
export async function deleteProductVariant(
  tenantId: string,
  productId: string,
  variantId: string,
  deletedBy: string,
): Promise<void> {
  const productScope = withSoftDelete({ id: productId, tenantId });
  const variantScope = withSoftDelete({ tenantId, productId });
  const editableProduct = {
    is: {
      ...productScope,
      status: { in: ["DRAFT", "ACTIVE"] },
    },
  } satisfies Prisma.ProductVariantWhereInput["product"];

  try {
    await prisma.$transaction(
      async (tx) => {
        const variant = await tx.productVariant.findFirst({
          where: {
            ...variantScope,
            id: variantId,
            product: { is: productScope },
          },
          select: {
            id: true,
            isDefault: true,
            product: { select: { status: true } },
          },
        });

        if (!variant) throw new NotFoundError("Variante non trovata");

        if (variant.product.status === "ARCHIVED") {
          throw new ConflictError("Non puoi cancellare una variante di un prodotto archiviato");
        }

        const documentLine = await tx.documentLine.findFirst({
          where: { tenantId, productVariantId: variant.id },
          select: { id: true },
        });

        if (documentLine) {
          throw new ConflictError(
            "La variante è presente in documenti e non può essere cancellata",
          );
        }

        const movement = await tx.stockMovement.findFirst({
          where: { tenantId, productVariantId: variant.id },
          select: { id: true },
        });

        if (movement) {
          throw new ConflictError(
            "La variante ha movimenti di magazzino e non può essere cancellata",
          );
        }

        const replacement = await tx.productVariant.findFirst({
          where: {
            ...variantScope,
            id: { not: variant.id },
            product: editableProduct,
            ...(variant.isDefault ? { active: true } : {}),
          },
          orderBy: [{ position: "asc" }, { id: "asc" }],
          select: { id: true },
        });

        if (!replacement) {
          throw new ConflictError(
            variant.isDefault
              ? "Non esiste un'altra variante attiva da impostare come predefinita"
              : "Non puoi cancellare l'ultima variante del prodotto",
          );
        }

        const deletion = await tx.productVariant.updateMany({
          where: {
            ...variantScope,
            id: variant.id,
            product: editableProduct,
            isDefault: variant.isDefault,
          },
          data: {
            deletedAt: new Date(),
            deletedBy,
            isDefault: false,
          },
        });

        if (deletion.count !== 1) {
          throw new ConflictError("La variante o il prodotto sono cambiati. Riprova.");
        }

        if (variant.isDefault) {
          const promotion = await tx.productVariant.updateMany({
            where: {
              ...variantScope,
              id: replacement.id,
              product: editableProduct,
              active: true,
              isDefault: false,
            },
            data: { isDefault: true },
          });

          if (promotion.count !== 1) {
            throw new ConflictError("La variante sostitutiva non è più disponibile. Riprova.");
          }
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2034" || error.code === "P2002") {
        throw new ConflictError(
          "Le varianti del prodotto sono cambiate durante l'operazione. Riprova.",
        );
      }
    }

    throw error;
  }
}
