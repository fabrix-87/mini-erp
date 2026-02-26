import { z } from "zod";
import {
  createManufacturerSchema,
  createProductCategorySchema,
  createProductImageSchema,
  createProductSchema,
  createProductVariantSchema,
  createProductTranslationSchema,
  manufacturerIdSchema,
  productCategoryIdSchema,
  productIdAsProductIdSchema,
  productIdSchema,
  productImageIdSchema,
  productQuerySchema,
  productVariantIdSchema,
  updateManufacturerSchema,
  updateProductCategorySchema,
  updateProductImageSchema,
  updateProductSchema,
  updateProductVariantSchema,
  updateProductTranslationSchema,
  productIdLanguageIdSchema, 
} from "../validators/product";
import { ProductCondition, ProductType, ProductStatus } from "../constants";
import { Supplier } from "./supplier";
import { Manufacturer } from "./manufacturer";
import { Attribute, AttributeGroup } from "./attribute";
import { Category } from "./category";
import { Language } from "./language";
import { StockMovement, VirtualStock } from "./warehouse";



// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Type Entity
export type Product = {
  id: number;
  type: ProductType;
  status: ProductStatus;
  reference: string;

  // Stati
  active: boolean;
  availableForOrder: boolean;
  showPrice: boolean;
  onlineOnly: boolean;
  onSale: boolean;

  // Prezzi di listino "Base" (opzionale: utile per mostrare "A partire da...")
  // Il prezzo transazionale reale sarà sulla Variante.
  price: number;
  wholesalePrice: number;
  ecotax: number;

  // Visibilità - Potrebbe essere un Enum o tabella esterna
  visibility: string;

  condition: ProductCondition;
  showCondition: boolean;

  // Relazione con il Brand del prodotto
  manufacturerId: number;
  manufacturer: Manufacturer;

  // Relazione con il fornitore
  supplierId: number;
  supplier: Supplier;

  // Logistica "Generale" (Opzionale, defaults)
  additionalShippingCost: number;
  carrierReferenceIds: string; // Json
  deliveryTimeNoteType: number;

  // Gestione dei redirect
  redirectType: "404" | string;
  redirectTarget: number;

  // Media
  coverThumbnailUrl?: string;

  // Dettagli del Prodotto
  translations: ProductTranslation[];
  variants: ProductVariant[];
  images: ProductImage[];
  categories: Category[];

  createdAt: Date;
  updatedAt: Date;
};

export type ProductVariant = {
  id: number;
  productId: number;
  variantCode: string;
  sku?: string;

  ean13?: string;
  upc?: string;
  isbn?: string;
  mpn?: string;

  // Stock e Magazzino
  quantity: number;
  minimalQuantity: number;
  lowStockThreshold: number;
  lowStockAlertEnabled: boolean;
  location?: string;

  packStockType: number;
  outOfStockType: number;
  availableDate?: Date;

  price?: number;
  wholesalePrice?: number;
  unitPriceRatio: number;

  // Dimensioni Fisiche
  weight: number | null;
  width: number | null;
  height: number | null;
  depth: number | null;

  // Codice Nomenclatura Combinata (NC8) per la variante specifica
  commodityCode?: string;
  commodity: any; // TODO IntrastatCommodityCode

  // Configurazione
  position: number;
  isDefault: boolean;
  active: boolean;
  availableForOrder: boolean;

  metadata?: string; // È una stringa JSON

  // Relazioni
  attributes: Attribute[];
  stockMovement: StockMovement[];
  virtualStock: VirtualStock[];
  images: ProductImage[];
};

export type ProductTranslation = {
  id: number;
  productId: number;
  languageId: number;
  language: Language;
  name: string;
  description?: string;
  shortDescription?: string;
  tags?: string;
  // SEO
  metaTitle?: string;
  metaDescription?: string | null;
  metaKeywords?: string;
  linkRewrite?: string;
  // Etichette disponibilità
  availableNowLabel: string;
  availableLaterLabel: string;
  deliveryTimeInStockNote?: string;
  deliveryTimeOutOfStockNote?: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface ProductImage {
  id: number;
  productId: number;
  variantId: number | null; 
  imageUrl: string;
  imageType: "main" | "extra" | string;
  position: number;
  isCover: boolean;
  altText: Record<string, any> | null; 
  width: number | null;
  height: number | null; 
  fileSize: number | null; 
  mimeType: string | null; 
  createdAt: Date; 
  updatedAt: Date; 
}

// Type Input
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateProductVariantInput = z.infer<
  typeof createProductVariantSchema
>;
export type UpdateProductVariantInput = z.infer<
  typeof updateProductVariantSchema
>;
export type CreateProductTranslationInput = z.infer<
  typeof createProductTranslationSchema
>;
export type UpdateProductTranslationInput = z.infer<
  typeof updateProductTranslationSchema
>;
export type CreateProductImageInput = z.infer<typeof createProductImageSchema>;
export type UpdateProductImageInput = z.infer<typeof updateProductImageSchema>;
export type CreateProductCategoryInput = z.infer<
  typeof createProductCategorySchema
>;
export type UpdateProductCategoryInput = z.infer<
  typeof updateProductCategorySchema
>;
export type CreateManufacturerInput = z.infer<typeof createManufacturerSchema>;
export type UpdateManufacturerInput = z.infer<typeof updateManufacturerSchema>;

// Type Param
export type ProductIdParam = z.infer<typeof productIdSchema>;
export type ProductVariantIdParam = z.infer<typeof productVariantIdSchema>;
export type ProductImageIdParam = z.infer<typeof productImageIdSchema>;
export type ManufacturerIdParam = z.infer<typeof manufacturerIdSchema>;
export type ProductCategoryIdParam = z.infer<typeof productCategoryIdSchema>;
export type ProductIdAsProductIdParam = z.infer<typeof productIdAsProductIdSchema>;
export type ProductIdLanguageIdParam = z.infer<typeof productIdLanguageIdSchema>;

// Type Query
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
