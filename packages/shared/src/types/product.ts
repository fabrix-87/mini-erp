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
import {
  ProductCondition,
  ProductType,
  ProductStatus,
  ProductPackStockType,
  ProductOutOfStockType,
} from "../constants";
import { Attribute } from "./attribute";
import { Category } from "./category";
import { ProductPackItem } from "./product-pack";
import { ProductChannelSetting } from "./product-channel";
import { ProductSupplier } from "./product-supplier";
import { ProductUom } from "./uom";
import { ProductVariantAxis } from "./product-variant-axis";

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Product = {
  id: string;
  tenantId: string;
  type: ProductType;
  status: ProductStatus;
  reference: string;
  availableForOrder: boolean;
  ecotax: string;
  packStockType: ProductPackStockType;
  outOfStockType: ProductOutOfStockType;
  baseUomId: string;
  defaultTaxRuleId?: number | null;
  condition: ProductCondition;
  manufacturerId?: string | null;
  commodityCode?: string | null;
  coverThumbnailUrl?: string | null;
  variants: ProductVariant[];
  variantAxes: ProductVariantAxis[];
  uoms: ProductUom[];
  images: ProductImage[];
  categories: Category[];
  translations: ProductTranslation[];
  channelSettings: ProductChannelSetting[];
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductVariant = {
  id: string;
  tenantId: string;
  productId: string;
  combinationKey: string;
  sku: string;
  ean13?: string | null;
  upc?: string | null;
  isbn?: string | null;
  mpn?: string | null;
  minimalQuantity: string;
  lowStockThreshold: string;
  lowStockAlertEnabled: boolean;
  location?: string | null;
  availableDate?: Date | null;
  weight?: string | null;
  width?: string | null;
  height?: string | null;
  depth?: string | null;
  position: number;
  isDefault: boolean;
  active: boolean;
  availableForOrder: boolean;
  metadata?: unknown | null;
  attributes: Attribute[];
  packItems: ProductPackItem[];
  supplierItems: ProductSupplier[];
  images: ProductImage[];
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductTranslation = {
  tenantId: string;
  productId: string;
  languageId: number;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductImage = {
  id: string;
  tenantId: string;
  productId: string;
  variantId: string | null;
  imageUrl: string;
  imageType: string;
  position: number;
  isCover: boolean;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  mimeType: string | null;
  translations: { languageId: number; description: string | null }[];
  createdAt: Date;
  updatedAt: Date;
};

// Type Input
export type CreateProductFormValues = z.input<typeof createProductSchema>;
export type UpdateProductFormValues = z.input<typeof updateProductSchema>;
export type CreateProductVariantFormValues = z.input<typeof createProductVariantSchema>;
export type UpdateProductVariantFormValues = z.input<typeof updateProductVariantSchema>;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>;
export type CreateProductTranslationInput = z.infer<typeof createProductTranslationSchema>;
export type UpdateProductTranslationInput = z.infer<typeof updateProductTranslationSchema>;
export type CreateProductImageInput = z.infer<typeof createProductImageSchema>;
export type UpdateProductImageInput = z.infer<typeof updateProductImageSchema>;
export type CreateProductCategoryInput = z.infer<typeof createProductCategorySchema>;
export type UpdateProductCategoryInput = z.infer<typeof updateProductCategorySchema>;
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
