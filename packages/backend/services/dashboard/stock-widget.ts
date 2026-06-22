// ============================================================================
// STOCK WIDGET SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-config";
import { MovementType } from "@mini-erp/shared";

/**
 * Fetch stock value (total inventory value based on confirmed movements).
 * Stock quantity: net of CONFIRMED inbound - outbound movements.
 * Stock value: net quantity × variant wholesalePrice (cost proxy).
 */
export async function fetchStockValue(tenantId: string): Promise<{
  totalValue: string;
  activeProducts: number;
  totalUnits: number;
}> {
  const INBOUND: MovementType[] = [
    "PURCHASE",
    "RETURN_IN",
    "ADJUSTMENT_IN",
    "TRANSFER_IN",
    "INVENTORY_START",
  ];
  const OUTBOUND: MovementType[] = ["SALE", "RETURN_OUT", "ADJUSTMENT_OUT", "TRANSFER_OUT"];

  // Aggregate confirmed movements per variant
  const [inboundAgg, outboundAgg] = await Promise.all([
    prisma.stockMovement.groupBy({
      by: ["productVariantId"],
      where: {
        status: "CONFIRMED",
        movementType: { in: INBOUND },
        productVariant: { tenantId, deletedAt: null, active: true },
      },
      _sum: { quantity: true },
    }),
    prisma.stockMovement.groupBy({
      by: ["productVariantId"],
      where: {
        status: "CONFIRMED",
        movementType: { in: OUTBOUND },
        productVariant: { tenantId, deletedAt: null, active: true },
      },
      _sum: { quantity: true },
    }),
  ]);

  const inboundMap = new Map(inboundAgg.map((r) => [r.productVariantId, r._sum.quantity ?? 0]));
  const outboundMap = new Map(outboundAgg.map((r) => [r.productVariantId, r._sum.quantity ?? 0]));

  const allVariantIds = [...new Set([...inboundMap.keys(), ...outboundMap.keys()])];

  // Fetch cost proxy (wholesalePrice) for valuation
  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: allVariantIds },
      tenantId,
      deletedAt: null,
      active: true,
    },
    select: {
      id: true,
      wholesalePrice: true,
    },
  });

  let totalValue = 0;
  let totalUnits = 0;

  for (const v of variants) {
    const netQty = (inboundMap.get(v.id) ?? 0) - (outboundMap.get(v.id) ?? 0);
    if (netQty <= 0) continue;

    const cost = parseFloat(v.wholesalePrice?.toString() ?? "0");
    totalValue += netQty * cost;
    totalUnits += netQty;
  }

  const activeProducts = await prisma.product.count({
    where: { tenantId, active: true, deletedAt: null },
  });

  return {
    totalValue: totalValue.toFixed(2),
    activeProducts,
    totalUnits,
  };
}

/**
 * Fetch recent CONFIRMED stock movements for a tenant.
 */
export async function fetchStockMovements(
  tenantId: string,
  limit: number,
): Promise<
  Array<{
    id: number; // StockMovement.id is Int @id @default(autoincrement())
    productVariantId: string; // FK to ProductVariant — cuid string
    sku: string;
    productReference: string;
    warehouseName: string;
    movementType: MovementType;
    quantity: number;
    movementDate: Date;
    referenceId: string | null;
  }>
> {
  const movements = await prisma.stockMovement.findMany({
    where: {
      status: "CONFIRMED",
      productVariant: { tenantId, deletedAt: null },
    },
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
      productVariant: {
        select: {
          sku: true,
          product: {
            select: { reference: true },
          },
        },
      },
    },
  });

  return movements.map((m) => ({
    id: m.id,
    productVariantId: m.productVariantId,
    sku: m.productVariant.sku,
    productReference: m.productVariant.product.reference,
    warehouseName: m.warehouse.name,
    movementType: m.movementType,
    quantity: m.quantity,
    movementDate: m.movementDate,
    referenceId: m.referenceId,
  }));
}
