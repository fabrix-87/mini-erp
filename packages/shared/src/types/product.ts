import { z } from "zod";
import {
  CreateManufacturerSchema,
  CreateProductCategorySchema,
  CreateProductImageSchema,
  CreateProductSchema,
  CreateProductTranslationSchema,
  CreateProductVariantSchema,
  ManufacturerIdSchema,
  ProductCategoryIdSchema,
  ProductIdLanguageSchema,
  ProductIdSchema,
  ProductImageIdSchema,
  ProductQuerySchema,
  ProductVariantIdSchema,
  UpdateManufacturerSchema,
  UpdateProductCategorySchema,
  UpdateProductImageSchema,
  UpdateProductSchema,
  UpdateProductTranslationSchema,
  UpdateProductVariantSchema,
} from "../validators/product";
import { ProductCondition, ProductType } from "../constants";
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
  translations: ProductTranslation[]; // Contiene 'name', 'description', 'shortDescription'
  variants: ProductVariant[];
  images: ProductImage[];
  categories: Category[];

  createdAt: Date;
  updatedAt: Date;
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
  weight: number;
  width: number;
  height: number;
  depth: number;

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

export interface ProductImage {
  id: number;
  productId: number;
  variantId: number;
  imageUrl: string;
  imageType: "main" | "extra" | string;
  position: number;
  isCover: boolean;
  altText: string | null;
}

// Type Input
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreateProductVariantInput = z.infer<
  typeof CreateProductVariantSchema
>;
export type UpdateProductVariantInput = z.infer<
  typeof UpdateProductVariantSchema
>;
export type CreateProductTranslationInput = z.infer<
  typeof CreateProductTranslationSchema
>;
export type UpdateProductTranslationInput = z.infer<
  typeof UpdateProductTranslationSchema
>;
export type CreateProductImageInput = z.infer<typeof CreateProductImageSchema>;
export type UpdateProductImageInput = z.infer<typeof UpdateProductImageSchema>;
export type CreateProductCategoryInput = z.infer<
  typeof CreateProductCategorySchema
>;
export type UpdateProductCategoryInput = z.infer<
  typeof UpdateProductCategorySchema
>;
export type CreateManufacturerInput = z.infer<typeof CreateManufacturerSchema>;
export type UpdateManufacturerInput = z.infer<typeof UpdateManufacturerSchema>;

// Type Param
export type ProductIdParam = z.infer<typeof ProductIdSchema>;
export type ProductVariantIdParam = z.infer<typeof ProductVariantIdSchema>;
export type ProductImageIdParam = z.infer<typeof ProductImageIdSchema>;
export type ManufacturerIdParam = z.infer<typeof ManufacturerIdSchema>;
export type ProductIdLanguageIdParam = z.infer<typeof ProductIdLanguageSchema>;
export type ProductCategoryIdParam = z.infer<typeof ProductCategoryIdSchema>;

// Type Query
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;
