// ============================================================================
// ATTRIBUTE TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import type { Language } from "./language";
import type { ProductVariant } from "./product";
import {
  attributeDisplayTypeSchema,
  createAttributeGroupSchema,
  updateAttributeGroupSchema,
  createAttributeGroupTranslationSchema,
  updateAttributeGroupTranslationSchema,
  createAttributeSchema,
  updateAttributeSchema,
  createAttributeTranslationSchema,
  updateAttributeTranslationSchema,
  createProductVariantAttributeSchema,
  bulkAssignAttributesSchema,
  bulkRemoveAttributesSchema,
  attributeGroupQuerySchema,
  attributeQuerySchema,
  productVariantAttributeQuerySchema,
  attributeGroupIdParamSchema,
  attributeIdParamSchema,
  attributeGroupTranslationParamSchema,
  attributeTranslationParamSchema,
  productVariantAttributeParamSchema,
  batchCreateAttributesSchema,
  batchUpdateAttributesSchema,
  batchDeleteAttributesSchema,
} from "../validators/attribute";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type AttributeDisplayType = z.infer<typeof attributeDisplayTypeSchema>;

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Attribute Group entity
 */
export type AttributeGroup = {
  id: number;
  code: string;
  displayType: AttributeDisplayType;
  position: number;
  isPublic: boolean;
  translations: AttributeGroupTranslation[];
  attributes: Attribute[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Attribute Group Translation entity
 */
export type AttributeGroupTranslation = {
  id: number;
  attributeGroupId: number;
  attributeGroup: AttributeGroup;
  languageId: number;
  language: Language;
  name: string;
  publicName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Attribute entity
 */
export type Attribute = {
  id: number;
  attributeGroupId: number;
  attributeGroup: AttributeGroup;
  code: string;
  colorHex: string | null;
  colorHex2: string | null;
  colorPms: string | null;
  colorPms2: string | null;
  imageUrl: string | null;
  position: number;
  translations: AttributeTranslation[];
  variants: ProductVariantAttribute[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Attribute Translation entity
 */
export type AttributeTranslation = {
  id: number;
  attributeId: number;
  attribute: Attribute;
  languageId: number;
  language: Language;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Product Variant Attribute junction entity
 */
export type ProductVariantAttribute = {
  productVariantId: number;
  productVariant: ProductVariant;
  attributeId: number;
  attribute: Attribute;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateAttributeGroupInput = z.infer<typeof createAttributeGroupSchema>;
export type UpdateAttributeGroupInput = z.infer<typeof updateAttributeGroupSchema>;

export type CreateAttributeGroupTranslationInput = z.infer<
  typeof createAttributeGroupTranslationSchema
>;
export type UpdateAttributeGroupTranslationInput = z.infer<
  typeof updateAttributeGroupTranslationSchema
>;

export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
export type UpdateAttributeInput = z.infer<typeof updateAttributeSchema>;

export type CreateAttributeTranslationInput = z.infer<
  typeof createAttributeTranslationSchema
>;
export type UpdateAttributeTranslationInput = z.infer<
  typeof updateAttributeTranslationSchema
>;

export type CreateProductVariantAttributeInput = z.infer<
  typeof createProductVariantAttributeSchema
>;
export type BulkAssignAttributesInput = z.infer<typeof bulkAssignAttributesSchema>;
export type BulkRemoveAttributesInput = z.infer<typeof bulkRemoveAttributesSchema>;

export type BatchCreateAttributesInput = z.infer<typeof batchCreateAttributesSchema>;
export type BatchUpdateAttributesInput = z.infer<typeof batchUpdateAttributesSchema>;
export type BatchDeleteAttributesInput = z.infer<typeof batchDeleteAttributesSchema>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type AttributeGroupQueryInput = z.infer<typeof attributeGroupQuerySchema>;
export type AttributeQueryInput = z.infer<typeof attributeQuerySchema>;
export type ProductVariantAttributeQueryInput = z.infer<
  typeof productVariantAttributeQuerySchema
>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type AttributeGroupIdParam = z.infer<typeof attributeGroupIdParamSchema>;
export type AttributeIdParam = z.infer<typeof attributeIdParamSchema>;
export type AttributeGroupTranslationParam = z.infer<
  typeof attributeGroupTranslationParamSchema
>;
export type AttributeTranslationParam = z.infer<typeof attributeTranslationParamSchema>;
export type ProductVariantAttributeParam = z.infer<
  typeof productVariantAttributeParamSchema
>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Attribute Group list item (simplified)
 */
export type AttributeGroupListItem = {
  id: number;
  code: string;
  name: string; // from translation
  displayType: AttributeDisplayType;
  position: number;
  attributesCount: number;
  isPublic: boolean;
};

/**
 * Attribute list item (simplified)
 */
export type AttributeListItem = {
  id: number;
  code: string;
  name: string; // from translation
  groupCode: string;
  groupName: string;
  position: number;
  colorHex: string | null;
  imageUrl: string | null;
};

/**
 * Attribute Group with translations and attributes
 */
export type AttributeGroupComplete = AttributeGroup & {
  translations: AttributeGroupTranslation[];
  attributes: AttributeComplete[];
};

/**
 * Attribute with translations
 */
export type AttributeComplete = Attribute & {
  translations: AttributeTranslation[];
  attributeGroup: AttributeGroup;
};

/**
 * Localized Attribute Group (single language)
 */
export interface LocalizedAttributeGroup {
  id: number;
  code: string;
  name: string;
  publicName: string | null;
  displayType: AttributeDisplayType;
  position: number;
  isPublic: boolean;
  attributes: LocalizedAttribute[];
}

/**
 * Localized Attribute (single language)
 */
export interface LocalizedAttribute {
  id: number;
  code: string;
  name: string;
  colorHex: string | null;
  colorHex2: string | null;
  colorPms: string | null;
  colorPms2: string | null;
  imageUrl: string | null;
  position: number;
}

/**
 * Product variant with attributes grouped
 */
export interface ProductVariantWithAttributes {
  variantId: number;
  variantCode: string;
  sku: string | null;
  attributeGroups: {
    groupId: number;
    groupCode: string;
    groupName: string;
    displayType: AttributeDisplayType;
    attributes: LocalizedAttribute[];
  }[];
}

/**
 * Attribute filter option (for frontend)
 */
export interface AttributeFilterOption {
  groupId: number;
  groupCode: string;
  groupName: string;
  displayType: AttributeDisplayType;
  options: {
    attributeId: number;
    code: string;
    name: string;
    colorHex: string | null;
    imageUrl: string | null;
    count: number; // Number of products with this attribute
    selected: boolean;
  }[];
}

/**
 * Attribute combination (for product configuration)
 */
export interface AttributeCombination {
  variantId: number;
  variantCode: string;
  sku: string | null;
  attributes: {
    groupCode: string;
    attributeCode: string;
  }[];
  price: number | null;
  quantity: number;
  available: boolean;
}

/**
 * Attribute validation result
 */
export interface AttributeValidationResult {
  valid: boolean;
  errors: {
    attributeGroupId: number;
    groupCode: string;
    message: string;
  }[];
  warnings: string[];
  missingGroups: {
    groupId: number;
    groupCode: string;
    groupName: string;
    required: boolean;
  }[];
}

/**
 * Attribute statistics
 */
export interface AttributeStatistics {
  totalGroups: number;
  totalAttributes: number;
  byDisplayType: Record<AttributeDisplayType, number>;
  mostUsedAttributes: {
    attributeId: number;
    attributeName: string;
    groupName: string;
    usageCount: number;
    variantCount: number;
  }[];
  unusedAttributes: {
    attributeId: number;
    attributeName: string;
    groupName: string;
  }[];
  groupsWithoutAttributes: {
    groupId: number;
    groupCode: string;
    groupName: string;
  }[];
}

/**
 * Color palette (for color attributes)
 */
export interface ColorPalette {
  groupId: number;
  groupCode: string;
  groupName: string;
  colors: {
    attributeId: number;
    code: string;
    name: string;
    hex: string;
    hex2: string | null; // For gradients
    pms: string | null;
    pms2: string | null;
    imageUrl: string | null;
    isPopular: boolean;
    usageCount: number;
  }[];
}

/**
 * Attribute comparison
 */
export interface AttributeComparison {
  groupCode: string;
  groupName: string;
  variants: {
    variantId: number;
    variantCode: string;
    attributeId: number;
    attributeCode: string;
    attributeName: string;
    colorHex: string | null;
    imageUrl: string | null;
  }[];
}

/**
 * Attribute matrix (for product configuration)
 */
export interface AttributeMatrix {
  groups: {
    groupId: number;
    groupCode: string;
    groupName: string;
    displayType: AttributeDisplayType;
  }[];
  combinations: {
    variantId: number;
    attributes: Record<string, string>; // groupCode -> attributeCode
    price: number | null;
    quantity: number;
    available: boolean;
  }[];
}

/**
 * Attribute import/export format
 */
export interface AttributeImportExport {
  groups: {
    code: string;
    displayType: AttributeDisplayType;
    position: number;
    isPublic: boolean;
    translations: {
      languageCode: string;
      name: string;
      publicName: string | null;
    }[];
    attributes: {
      code: string;
      colorHex: string | null;
      colorHex2: string | null;
      colorPms: string | null;
      colorPms2: string | null;
      imageUrl: string | null;
      position: number;
      translations: {
        languageCode: string;
        name: string;
      }[];
    }[];
  }[];
}

/**
 * Attribute bulk operation result
 */
export interface AttributeBulkOperationResult {
  success: boolean;
  created: number;
  updated: number;
  deleted: number;
  failed: number;
  errors: {
    index: number;
    code: string | null;
    message: string;
  }[];
}

/**
 * Attribute suggestion (for autocomplete)
 */
export interface AttributeSuggestion {
  attributeId: number;
  code: string;
  name: string;
  groupId: number;
  groupCode: string;
  groupName: string;
  colorHex: string | null;
  imageUrl: string | null;
  relevance: number; // 0-1 score
}

/**
 * Attribute dashboard metrics
 */
export interface AttributeDashboardMetrics {
  totalGroups: number;
  totalAttributes: number;
  activeGroups: number;
  publicGroups: number;
  byDisplayType: {
    type: AttributeDisplayType;
    count: number;
    percentage: number;
  }[];
  recentlyAdded: AttributeListItem[];
  mostPopular: {
    attributeId: number;
    name: string;
    groupName: string;
    usageCount: number;
    trend: "up" | "down" | "stable";
  }[];
  alerts: {
    type: "missing_translation" | "unused_attribute" | "empty_group";
    severity: "high" | "medium" | "low";
    message: string;
    affectedIds: number[];
  }[];
}
