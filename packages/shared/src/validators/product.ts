// packages/shared/src/validators/product.ts
import { z } from "zod";
import { isoDateSchema } from "./primitives/date";
import {
  createDecimalSchema,
  nullableDecimalSchema,
  quantityOptionalSchema,
  quantitySchema,
  unitAmountOptionalSchema,
  unitAmountSchema,
} from "./primitives/decimal";
import {
  attributeGroupIdBaseSchema,
  attributeIdBaseSchema,
  inputJsonValueSchema,
  languageIdBaseSchema,
  manufacturerIdBaseSchema,
  productCategoryIdBaseSchema,
  productIdBaseSchema,
  productImageIdBaseSchema,
  productVariantIdBaseSchema,
  salesChannelIdBaseSchema,
  supplierIdBaseSchema,
  taxRuleIdBaseSchema,
  uomIdBaseSchema,
} from "./base";
import { limitSchema, pageSchema, sortOrderSchema } from "./query/pagination";
import {
  MAX_LINE_QUANTITY,
  MAX_PRODUCT_VARIANT_AXES,
  MIN_POSITIVE_QUANTITY,
  PRODUCT_CONDITION,
  PRODUCT_OUT_OF_STOCK_TYPE,
  PRODUCT_PACK_STOCK_TYPE,
  PRODUCT_REDIRECT_TYPE,
  PRODUCT_SORT_FIELDS,
  PRODUCT_STATUS,
  PRODUCT_TYPE,
  PRODUCT_VISIBILITY,
} from "../constants";
import { queryBooleanOrAllSchema } from "./query";

// ============================================================================
// ENUMS
// ============================================================================

export const productTypeSchema = z.enum(PRODUCT_TYPE);
export const productConditionSchema = z.enum(PRODUCT_CONDITION);
export const productStatusSchema = z.enum(PRODUCT_STATUS);
export const productPackStockTypeSchema = z.enum(PRODUCT_PACK_STOCK_TYPE);
export const productOutOfStockTypeSchema = z.enum(PRODUCT_OUT_OF_STOCK_TYPE);
export const productVisibilitySchema = z.enum(PRODUCT_VISIBILITY);
export const productRedirectTypeSchema = z.enum(PRODUCT_REDIRECT_TYPE);
export const productSortFieldSchema = z.enum(PRODUCT_SORT_FIELDS);

// ============================================================================
// PRODUCT VARIANT
// ============================================================================

const dimensionSchema = nullableDecimalSchema(
  createDecimalSchema(6, { positiveOnly: true, min: 0 }),
);

const minimalQuantityOptions = {
  positiveOnly: true,
  min: MIN_POSITIVE_QUANTITY,
  max: MAX_LINE_QUANTITY,
  messages: { min: "La quantità minima deve essere maggiore di zero" },
} as const;

const variantBaseShape = {
  sku: z.string().min(1, "Lo SKU è obbligatorio").max(64, "Lo SKU non può superare 64 caratteri").trim(),
  ean13: z.string().regex(/^\d{13}$/, "L'EAN-13 deve contenere 13 cifre").nullish(),
  upc: z.string().regex(/^\d{12}$/, "L'UPC deve contenere 12 cifre").nullish(),
  isbn: z.string().max(32).nullish(),
  mpn: z.string().max(40).nullish(),

  minimalQuantity: createDecimalSchema(6, minimalQuantityOptions),
  lowStockThreshold: quantityOptionalSchema,
  lowStockAlertEnabled: z.boolean(),
  location: z.string().max(50).nullish(),
  availableDate: isoDateSchema().nullish(),

  weight: dimensionSchema,
  width: dimensionSchema,
  height: dimensionSchema,
  depth: dimensionSchema,

  position: z.number().int().min(0),
  isDefault: z.boolean(),
  active: z.boolean(),
  availableForOrder: z.boolean(),
  metadata: inputJsonValueSchema.nullish(),

  /** Attribute values of this variant, one per axis. combinationKey is computed server-side. */
  attributeIds: z.array(attributeIdBaseSchema).max(MAX_PRODUCT_VARIANT_AXES),
};

const variantCreateDefaults = {
  minimalQuantity: createDecimalSchema(6, { ...minimalQuantityOptions, defaultValue: 1 }),
  lowStockThreshold: quantitySchema(0),
  lowStockAlertEnabled: z.boolean().default(false),
  position: z.number().int().min(0).default(0),
  isDefault: z.boolean().default(false),
  active: z.boolean().default(true),
  availableForOrder: z.boolean().default(true),
  attributeIds: z.array(attributeIdBaseSchema).max(MAX_PRODUCT_VARIANT_AXES).default([]),
};

/** Variant payload nested inside createProductSchema (no productId). */
export const createProductVariantInlineSchema = z
  .object(variantBaseShape)
  .extend(variantCreateDefaults)
  .strict();

/** Standalone variant creation (POST /products/:id/variants). */
export const createProductVariantSchema = z
  .object({ productId: productIdBaseSchema, ...variantBaseShape })
  .extend(variantCreateDefaults)
  .strict();

export const updateProductVariantSchema = z.object(variantBaseShape).partial().strict();

export const productVariantIdSchema = z.object({ id: productVariantIdBaseSchema });

// ============================================================================
// PRODUCT
// ============================================================================

const productBaseShape = {
  type: productTypeSchema,
  status: productStatusSchema,
  reference: z.string().min(1, "Il riferimento è obbligatorio").max(64, "Il riferimento non può superare 64 caratteri").trim(),
  availableForOrder: z.boolean(),
  ecotax: unitAmountOptionalSchema,
  packStockType: productPackStockTypeSchema,
  outOfStockType: productOutOfStockTypeSchema,
  /** Immutable once the product has stock movements (enforced in controller). */
  baseUomId: uomIdBaseSchema,
  defaultTaxRuleId: taxRuleIdBaseSchema.nullish(),
  condition: productConditionSchema,
  manufacturerId: manufacturerIdBaseSchema.nullish(),
  /** NC8 code; existence in IntrastatCommodityCode is checked in controller. */
  commodityCode: z.string().regex(/^\d{8}$/, "Il codice NC8 deve contenere 8 cifre").nullish(),
  coverThumbnailUrl: z.string().max(500).nullish(),
};

export const productVariantAxisInputSchema = z
  .object({
    attributeGroupId: attributeGroupIdBaseSchema,
    position: z.number().int().min(0).default(0),
  })
  .strict();

export const createProductSchema = z
  .object(productBaseShape)
  .extend({
    type: productTypeSchema.default("STANDARD"),
    status: productStatusSchema.default("DRAFT"),
    availableForOrder: z.boolean().default(true),
    ecotax: unitAmountSchema,
    packStockType: productPackStockTypeSchema.default("USE_PACK_STOCK_ONLY"),
    outOfStockType: productOutOfStockTypeSchema.default("DENY_ORDERS"),
    condition: productConditionSchema.default("NEW"),
    axes: z.array(productVariantAxisInputSchema).max(MAX_PRODUCT_VARIANT_AXES).default([]),
    variants: z.array(createProductVariantInlineSchema).min(1, "Almeno una variante è obbligatoria"),
  })
  .strict()
  .superRefine((data, ctx) => {
    const defaults = data.variants.filter((v) => v.isDefault).length;
    if (defaults > 1 || (data.variants.length > 1 && defaults !== 1)) {
      ctx.addIssue({ code: "custom", path: ["variants"], message: "Una sola variante deve essere impostata come default" });
    }
    if (new Set(data.axes.map((a) => a.attributeGroupId)).size !== data.axes.length) {
      ctx.addIssue({ code: "custom", path: ["axes"], message: "Gli assi devono riferirsi a gruppi di attributi distinti" });
    }
    if (data.axes.length === 0 && data.variants.length > 1) {
      ctx.addIssue({ code: "custom", path: ["variants"], message: "Senza assi è ammessa una sola variante" });
    }
    data.variants.forEach((v, i) => {
      if (v.attributeIds.length !== data.axes.length) {
        ctx.addIssue({ code: "custom", path: ["variants", i, "attributeIds"], message: "Un valore di attributo per ogni asse" });
      }
    });
  });

/** Variants and axes are managed through dedicated endpoints, not through product update. */
export const updateProductSchema = z.object(productBaseShape).partial().strict();

export const productIdSchema = z.object({ id: productIdBaseSchema });
export const productIdAsProductIdSchema = z.object({ productId: productIdBaseSchema });

// ============================================================================
// TRANSLATION / IMAGE / CATEGORY / MANUFACTURER
// ============================================================================

const productTranslationBaseShape = {
  name: z.string().min(1, "Il nome è obbligatorio").max(255, "Il nome non può superare 255 caratteri").trim(),
  description: z.string().nullish(),
  shortDescription: z.string().max(500).nullish(),
};

export const createProductTranslationSchema = z
  .object({ productId: productIdBaseSchema, languageId: languageIdBaseSchema, ...productTranslationBaseShape })
  .strict();
export const updateProductTranslationSchema = z.object(productTranslationBaseShape).partial().strict();
export const productIdLanguageIdSchema = z.object({ id: productIdBaseSchema, languageId: languageIdBaseSchema });

const productImageBaseShape = {
  variantId: productVariantIdBaseSchema.nullish(),
  imageUrl: z.url("URL non valido").max(500),
  imageType: z.string().max(20),
  position: z.number().int().min(0),
  isCover: z.boolean(),
  width: z.number().int().positive().nullish(),
  height: z.number().int().positive().nullish(),
  fileSize: z.number().int().positive().nullish(),
  mimeType: z.string().max(50).nullish(),
  /** Localized alt text, stored in ProductImageTranslation. */
  translations: z
    .array(z.object({ languageId: languageIdBaseSchema, description: z.string().nullish() }).strict())
    .default([]),
};

export const createProductImageSchema = z
  .object({ productId: productIdBaseSchema, ...productImageBaseShape })
  .extend({
    imageType: z.string().max(20).default("extra"),
    position: z.number().int().min(0).default(0),
    isCover: z.boolean().default(false),
  })
  .strict();
export const updateProductImageSchema = z.object(productImageBaseShape).partial().strict();
export const productImageIdSchema = z.object({ id: productImageIdBaseSchema, productId: productIdBaseSchema });

export const createProductCategorySchema = z
  .object({ productId: productIdBaseSchema, categoryId: productCategoryIdBaseSchema, position: z.number().int().min(0).default(0) })
  .strict();
export const updateProductCategorySchema = z.object({ position: z.number().int().min(0) }).strict();
export const productCategoryIdSchema = z.object({ categoryId: productCategoryIdBaseSchema, productId: productIdBaseSchema });

// Manufacturer: unchanged, except customFields
const manufacturerBaseShape = {
  name: z.string().min(1, "Il nome è obbligatorio").trim(),
  active: z.boolean(),
  customFields: inputJsonValueSchema.nullish(),
};
export const createManufacturerSchema = z.object(manufacturerBaseShape).extend({ active: z.boolean().default(true) }).strict();
export const updateManufacturerSchema = z.object(manufacturerBaseShape).partial().strict();
export const manufacturerIdSchema = z.object({ id: manufacturerIdBaseSchema });

// ============================================================================
// QUERY
// ============================================================================

export const productQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  status: productStatusSchema.optional(),
  type: productTypeSchema.optional(),
  condition: productConditionSchema.optional(),
  categoryId: productCategoryIdBaseSchema.optional(),
  manufacturerId: manufacturerIdBaseSchema.optional(),
  /** Resolved through ProductSupplier -> variants, not a Product column. */
  supplierId: supplierIdBaseSchema.optional(),
  /** Filters products published on a given sales channel. */
  channelId: salesChannelIdBaseSchema.optional(),
  isPublished: queryBooleanOrAllSchema(),
  sortBy: productSortFieldSchema.default("createdAt"),
  sortOrder: sortOrderSchema,
});