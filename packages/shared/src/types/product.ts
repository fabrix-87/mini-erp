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
  productVariantDetailParamsSchema,
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
export type ProductVariantDetailParams = z.infer<typeof productVariantDetailParamsSchema>;

// Type Query
export type ProductQueryInput = z.infer<typeof productQuerySchema>;

// Type Response
export type CreateProductResponse = {
  id: string;
  reference: string;
  type: ProductType;
  status: ProductStatus;
  baseUomId: string;
  ecotax: string;
  createdAt: string;
  variants: {
    id: string;
    sku: string;
    position: number;
    isDefault: boolean;
    active: boolean;
    attributeIds: string[];
  }[];
};

/** JSON representation of a product translation returned by the catalog API. */
export type ProductTranslationResponse = {
  productId: string;
  languageId: number;
  name: string;
  description: string | null;
  shortDescription: string | null;
  createdAt: string;
  updatedAt: string;
  language: {
    id: number;
    name: string;
    isoCode: string;
  };
};

/** JSON representation of a product in the catalog detail view. */
export type ProductDetailResponse = {
  id: string;
  reference: string;
  type: ProductType;
  status: ProductStatus;
  condition: ProductCondition;
  availableForOrder: boolean;
  baseUomId: string;
  ecotax: string;
  coverThumbnailUrl: string | null;
  defaultTaxRuleId: number | null;
  manufacturerId: string | null;
  createdAt: string;
  updatedAt: string;
  manufacturer: { id: string; name: string } | null;
  translations: {
    languageId: number;
    name: string;
    description: string | null;
    shortDescription: string | null;
  }[];
  variants: {
    id: string;
    sku: string;
    ean13: string | null;
    weight: string | null;
    width: string | null;
    height: string | null;
    depth: string | null;
    isDefault: boolean;
    active: boolean;
    attributes: {
      attributeGroupId: string;
      attributeId: string;
      attribute: {
        id: string;
        code: string;
        attributeGroup: { id: string; code: string };
        translations: { languageId: number; name: string }[];
      };
    }[];
  }[];
  images: {
    id: string;
    imageUrl: string;
    imageType: string;
    position: number;
    isCover: boolean;
  }[];
  categories: {
    categoryId: string;
    position: number;
    category: { id: string };
  }[];
};

/** JSON representation of one row in the product catalog list. */
export type ProductListItemResponse = {
  id: string;
  reference: string;
  type: ProductType;
  status: ProductStatus;
  condition: ProductCondition;
  availableForOrder: boolean;
  coverThumbnailUrl: string | null;
  manufacturerId: string | null;
  manufacturer: { id: string; name: string } | null;
  translations: {
    languageId: number;
    name: string;
    shortDescription: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
};

/** JSON representation returned by the product variant read endpoints. */
export type ProductVariantResponse = {
  id: string;
  productId: string;
  sku: string;
  ean13: string | null;
  upc: string | null;
  isbn: string | null;
  mpn: string | null;
  minimalQuantity: string;
  lowStockThreshold: string;
  lowStockAlertEnabled: boolean;
  location: string | null;
  availableDate: string | null;
  weight: string | null;
  width: string | null;
  height: string | null;
  depth: string | null;
  position: number;
  isDefault: boolean;
  active: boolean;
  availableForOrder: boolean;
  createdAt: string;
  updatedAt: string;
  attributes: {
    attributeId: string;
    attributeGroupId: string;
    attribute: {
      id: string;
      code: string;
      attributeGroup: { id: string; code: string };
      translations: { languageId: number; name: string }[];
    };
  }[];
};

export type ProductImageResponse = {
  id: string;
  productId: string;
  variantId: string | null;
  imageUrl: string;
  imageType: string;
  position: number;
  isCover: boolean;
  width: string | null;
  height: string | null;
  fileSize: string | null;
  mimeType: string | null;
  translations: { languageId: number; description: string | null }[];
  createdAt: string;
  updatedAt: string;
};