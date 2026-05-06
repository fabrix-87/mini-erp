// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

import { prisma } from "@/config/prisma-config";

/**
 * Applica strategia di pricing
 */
export const applyPricingStrategy = (
  basePrice: number,
  strategy: string,
  strategyValue: number,
  roundingMethod: string | null,
): number => {
  let finalPrice = basePrice;

  switch (strategy) {
    case "PERCENT_DECREASE":
      finalPrice = basePrice * (1 - strategyValue / 100);
      break;
    case "PERCENT_INCREASE":
      finalPrice = basePrice * (1 + strategyValue / 100);
      break;
    case "FIXED_DECREASE":
      finalPrice = basePrice - strategyValue;
      break;
    case "FIXED_INCREASE":
      finalPrice = basePrice + strategyValue;
      break;
    case "EXPLICIT":
    default:
      finalPrice = basePrice;
  }

  // Arrotondamento
  if (roundingMethod) {
    switch (roundingMethod) {
      case "nearest_05":
        finalPrice = Math.round(finalPrice * 20) / 20;
        break;
      case "nearest_10":
        finalPrice = Math.round(finalPrice / 10) * 10;
        break;
      case "up":
        finalPrice = Math.ceil(finalPrice);
        break;
      case "down":
        finalPrice = Math.floor(finalPrice);
        break;
    }
  }

  return Math.max(0, finalPrice);
};

/**
 * Calcola prezzo ricorsivamente da listini parent
 */
export const calculatePriceFromParent = async (
  priceListId: number,
  variantId: number,
  quantity: number = 1,
): Promise<number | null> => {
  const priceList = await prisma.priceList.findUnique({
    where: { id: priceListId },
    include: {
      parentList: true,
    },
  });

  if (!priceList) return null;

  // Cerca prezzo esplicito nel listino corrente
  const item = await prisma.priceListItem.findFirst({
    where: {
      priceListId,
      variantId,
      minQuantity: { lte: quantity },
    },
    orderBy: { minQuantity: "desc" },
  });

  if (item && priceList.strategy === "EXPLICIT") {
    return parseFloat(item.price.toString());
  }

  // Se non trovato o strategia dinamica, cerca nel parent
  if (priceList.parentListId) {
    const parentPrice = await calculatePriceFromParent(priceList.parentListId, variantId, quantity);

    if (parentPrice !== null) {
      return applyPricingStrategy(
        parentPrice,
        priceList.strategy,
        parseFloat(priceList.strategyValue.toString()),
        priceList.roundingMethod,
      );
    }
  }

  // Se esiste item esplicito ma strategia dinamica
  if (item) {
    return parseFloat(item.price.toString());
  }

  return null;
};
