// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "../config/prisma-config";

/**
 * Selezione standard per query Product con relazioni
 */
export const getProductSelection = () => ({
  id: true,
  type: true,
  reference: true,
  status: true,
  active: true,
  availableForOrder: true,
  showPrice: true,
  onlineOnly: true,
  onSale: true,
  price: true,
  wholesalePrice: true,
  ecotax: true,
  visibility: true,
  condition: true,
  showCondition: true,
  additionalShippingCost: true,
  redirectType: true,
  coverThumbnailUrl: true,
  defaultTaxRuleId: true,
  manufacturerId: true,
  supplierId: true,
  createdAt: true,
  updatedAt: true,
  manufacturer: {
    select: { id: true, name: true },
  },
  translations: {
    select: {
      id: true,
      languageId: true,
      name: true,
      description: true,
      shortDescription: true,
      metaTitle: true,
      linkRewrite: true,
      availableNowLabel: true,
      availableLaterLabel: true,
    },
  },
  variants: {
    select: {
      id: true,
      variantCode: true,
      sku: true,
      ean13: true,
      price: true,
      wholesalePrice: true,
      quantity: true,
      weight: true,
      width: true,
      height: true,
      depth: true,
      isDefault: true,
      active: true,      
      attributes: {
        include: {
          attribute: {
            include: {
              attributeGroup: true,
              translations: true,
            },
          },
        },
      },
    },
    orderBy: { position: "asc" as const },
  },
  images: {
    select: {
      id: true,
      imageUrl: true,
      imageType: true,
      position: true,
      isCover: true,
    },
    orderBy: { position: "asc" as const },
  },
  categories: {
    select: {
      categoryId: true,
      position: true,
      category: {
        select: { id: true, level: true },
      },
    },
  },
}) satisfies Prisma.ProductSelect;


/**
 * Genera automaticamente un variantCode se non fornito
 */
export const generateVariantCode = (productReference: string, index: number = 0): string => {
  const timestamp = Date.now().toString(36);
  return index === 0 
    ? `${productReference}-DEFAULT`
    : `${productReference}-VAR-${index}-${timestamp}`;
};

/**
 * Verifica che il prodotto abbia almeno una variante
 * Utilizzato come validazione aggiuntiva
 */
export const ensureProductHasVariants = async (productId: number): Promise<boolean> => {
  const variantCount = await prisma.productVariant.count({
    where: { productId },
  });
  
  return variantCount > 0;
};

/**
 * Ottieni la variante di default di un prodotto
 */
export const getDefaultVariant = async (productId: number) => {
  let defaultVariant = await prisma.productVariant.findFirst({
    where: { productId, isDefault: true },
  });
  
  // Se non c'è una variante default, prendi la prima disponibile
  if (!defaultVariant) {
    defaultVariant = await prisma.productVariant.findFirst({
      where: { productId },
      orderBy: { position: 'asc' },
    });
  }
  
  return defaultVariant;
};