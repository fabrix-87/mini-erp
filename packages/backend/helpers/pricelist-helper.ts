// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

import { prisma } from "@/config/prisma-config";
import { PriceListStrategy, RoundingMethod } from "@mini-erp/shared";
import { Decimal } from "@prisma/client/runtime/client";

/**
 * Applica strategia di pricing
 */
export const applyPricingStrategy = (
  basePrice: Decimal,
  strategy: PriceListStrategy,
  strategyValue: Decimal,
  roundingMethod: RoundingMethod | null,
): Decimal => {
  let finalPrice = basePrice;

  switch (strategy) {
    case "PERCENT_DECREASE":
      // basePrice * (1 - strategyValue / 100)
      finalPrice = basePrice.mul(new Decimal(1).minus(strategyValue.div(100)));
      break;
    case "PERCENT_INCREASE":
      // basePrice * (1 + strategyValue / 100)
      finalPrice = basePrice.mul(new Decimal(1).plus(strategyValue.div(100)));
      break;
    case "FIXED_DECREASE":
      finalPrice = basePrice.minus(strategyValue);
      break;
    case "FIXED_INCREASE":
      finalPrice = basePrice.plus(strategyValue);
      break;
    case "EXPLICIT":
    default:
      finalPrice = basePrice;
  }

  // Arrotondamento con Decimal
  if (roundingMethod) {
    switch (roundingMethod) {
      case "NEAREST_05": {
        // Equivalente a Math.round(val * 20) / 20 (arrotondamento al 0.05 più vicino)
        const multiplier = new Decimal(20);
        finalPrice = finalPrice
          .mul(multiplier)
          .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
          .div(multiplier);
        break;
      }
      case "NEAREST_10": {
        // Arrotondamento al 10 più vicino (es. 123 -> 120)
        const divisor = new Decimal(10);
        finalPrice = finalPrice.div(divisor).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).mul(divisor);
        break;
      }
      case "ROUND_UP":
        finalPrice = finalPrice.toDecimalPlaces(0, Decimal.ROUND_CEIL);
        break;
      case "ROUND_DOWN":
        finalPrice = finalPrice.toDecimalPlaces(0, Decimal.ROUND_FLOOR);
        break;
    }
  }

  // Assicura che il prezzo non sia mai inferiore a 0
  return Decimal.max(0, finalPrice);
};
/**
 * Calcola prezzo ricorsivamente da listini parent
 */
export const calculatePriceFromParent = async (
  priceListId: string,
  variantId: string,
  tenantId: string,
  quantity: number = 1,
): Promise<Decimal | null> => {
  const priceList = await prisma.priceList.findUnique({
    where: { id: priceListId, tenantId },
    include: {
      parentList: true,
    },
  });

  if (!priceList) return null;

  // Cerca prezzo esplicito nel listino corrente
  const item = await prisma.priceListItem.findFirst({
    where: {
      tenantId,
      priceListId,
      variantId,
      minQuantity: { lte: quantity },
    },
    orderBy: { minQuantity: "desc" },
  });

  if (item && priceList.strategy === "EXPLICIT") {
    return item.price;
  }

  // Se non trovato o strategia dinamica, cerca nel parent
  if (priceList.parentListId) {
    const parentPrice = await calculatePriceFromParent(
      priceList.parentListId,
      variantId,
      tenantId,
      quantity,
    );

    if (parentPrice !== null) {
      return applyPricingStrategy(
        parentPrice,
        priceList.strategy,
        priceList.strategyValue,
        priceList.roundingMethod,
      );
    }
  }

  // Se esiste item esplicito ma strategia dinamica
  if (item) {
    return item.price;
  }

  return null;
};
