// ============================================================================
// STOCK WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";

/**
 * Fetch stock value (total inventory value)
 */
export async function fetchStockValue(): Promise<{
  totalValue: string;
  activeProducts: number;
  totalUnits: number;
}> {
  const variants = await prisma.productVariant.findMany({
    where: {
      deletedAt: null,
      active: true,
    },
    select: {
      quantity: true,
      price: true,
    },
  });

  let totalValue = 0;
  let totalUnits = 0;

  for (const variant of variants) {
    const qty = parseFloat(variant.quantity.toString());
    const price = parseFloat(variant.price?.toString() ?? "0");
    totalValue += qty * price;
    totalUnits += qty;
  }

  const activeProducts = await prisma.product.count({
    where: { active: true, deletedAt: null },
  });

  return {
    totalValue: totalValue.toFixed(2),
    activeProducts,
    totalUnits,
  };
}

/**
 * Fetch recent stock movements
 */
export async function fetchStockMovements(
  limit: number,
): Promise<
  Array<{
    id: number;
    productVariantId: number;
    warehouseName: string;
    movementType: string;
    quantity: number;
    movementDate: Date;
    reference: string | null;
  }>
> {
  const movements = await prisma.stockMovement.findMany({
    take: limit,
    orderBy: { movementDate: "desc" },
    select: {
      id: true,
      productVariantId: true,
      movementType: true,
      quantity: true,
      movementDate: true,
      referenceId: true,
      warehouse: {
        select: { name: true },
      },
    },
  });

  return movements.map((m) => ({
    id: m.id,
    productVariantId: m.productVariantId,
    warehouseName: m.warehouse.name,
    movementType: m.movementType,
    quantity: m.quantity,
    movementDate: m.movementDate,
    reference: m.referenceId,
  }));
}
