// ============================================================================
// CATEGORY TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import type { Language } from "./language";
import type { Product } from "./product";
import {
  createCategorySchema,
  updateCategorySchema,
  createCategoryTranslationSchema,
  updateCategoryTranslationSchema,
  moveCategorySchema,
  reorderCategoriesSchema,
  duplicateCategorySchema,
  bulkUpdateCategoriesSchema,
  bulkDeleteCategoriesSchema,
  bulkMoveCategoriesSchema,
  categoryQuerySchema,
  categoryTreeQuerySchema,
  categoryPathQuerySchema,
  categorySiblingsQuerySchema,
  categoryIdParamSchema,
  categoryTranslationParamSchema,
  categoryStatsSchema,
} from "../validators/category";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Category entity
 */
export type Category = {
  id: number;
  parentId: number | null;
  code: string | null;
  parent: Category | null;
  children: Category[];
  active: boolean;
  position: number;
  level: number;
  translations: CategoryTranslation[];
  products: Product[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Category Translation entity
 */
export type CategoryTranslation = {
  id: number;
  categoryId: number;
  category: Category;
  languageId: number;
  language: Language;
  name: string;
  slug: string | null;
  description: string | null;
  linkRewrite: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export type CreateCategoryTranslationInput = z.infer<
  typeof createCategoryTranslationSchema
>;
export type UpdateCategoryTranslationInput = z.infer<
  typeof updateCategoryTranslationSchema
>;

export type MoveCategoryInput = z.infer<typeof moveCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
export type DuplicateCategoryInput = z.infer<typeof duplicateCategorySchema>;

export type BulkUpdateCategoriesInput = z.infer<
  typeof bulkUpdateCategoriesSchema
>;
export type BulkDeleteCategoriesInput = z.infer<
  typeof bulkDeleteCategoriesSchema
>;
export type BulkMoveCategoriesInput = z.infer<typeof bulkMoveCategoriesSchema>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type CategoryQueryInput = z.infer<typeof categoryQuerySchema>;
export type CategoryTreeQueryInput = z.infer<typeof categoryTreeQuerySchema>;
export type CategoryPathQueryInput = z.infer<typeof categoryPathQuerySchema>;
export type CategorySiblingsQueryInput = z.infer<
  typeof categorySiblingsQuerySchema
>;
export type CategoryStatsInput = z.infer<typeof categoryStatsSchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
export type CategoryTranslationParam = z.infer<
  typeof categoryTranslationParamSchema
>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Category list item (simplified)
 */
export type CategoryListItem = {
  id: number;
  code: string | null;
  name: string; // from translation
  slug: string | null;
  parentId: number | null;
  level: number;
  position: number;
  active: boolean;
  productCount: number;
  childrenCount: number;
};

/**
 * Category tree node
 */
export interface CategoryTreeNode {
  id: number;
  code: string | null;
  name: string;
  slug: string | null;
  parentId: number | null;
  level: number;
  position: number;
  active: boolean;
  productCount: number;
  children: CategoryTreeNode[];
  hasChildren: boolean;
  path: string; // Full path (e.g., "Home > Electronics > Phones")
  pathIds: number[]; // Array of ancestor IDs
}

/**
 * Category breadcrumb item
 */
export interface CategoryBreadcrumb {
  id: number;
  code: string | null;
  name: string;
  slug: string | null;
  level: number;
  url: string;
}

/**
 * Category with full details
 */
export type CategoryComplete = Category & {
  translations: CategoryTranslation[];
  children: Category[];
  parent: Category | null;
  products: Product[];
};

/**
 * Localized Category (single language)
 */
export interface LocalizedCategory {
  id: number;
  code: string | null;
  name: string;
  slug: string | null;
  description: string | null;
  linkRewrite: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  parentId: number | null;
  level: number;
  position: number;
  active: boolean;
}

/**
 * Category with children (recursive)
 */
export interface CategoryWithChildren extends LocalizedCategory {
  children: CategoryWithChildren[];
  productCount: number;
  totalProductCount: number; // Including children
}

/**
 * Category path
 */
export interface CategoryPath {
  categoryId: number;
  path: CategoryBreadcrumb[];
  fullPath: string; // Concatenated names
  depth: number;
}

/**
 * Category siblings
 */
export interface CategorySiblings {
  categoryId: number;
  parentId: number | null;
  siblings: CategoryListItem[];
  position: number;
  totalSiblings: number;
}

/**
 * Category statistics
 */
export interface CategoryStatistics {
  categoryId: number;
  categoryName: string;
  totalProducts: number;
  activeProducts: number;
  totalSubcategories: number;
  activeSubcategories: number;
  depth: number;
  descendants: number; // Total number of descendant categories
  productsInChildren: number;
  averageProductsPerChild: number;
  mostPopularSubcategory: {
    id: number;
    name: string;
    productCount: number;
  } | null;
}

/**
 * Category move validation result
 */
export interface CategoryMoveValidation {
  valid: boolean;
  canMove: boolean;
  errors: string[];
  warnings: string[];
  newLevel: number;
  affectedCategories: number;
  maxDepthExceeded: boolean;
  wouldCreateCycle: boolean;
}

/**
 * Category tree statistics
 */
export interface CategoryTreeStatistics {
  totalCategories: number;
  rootCategories: number;
  maxDepth: number;
  averageDepth: number;
  categoriesWithoutProducts: number;
  categoriesWithoutChildren: number;
  emptyCategories: number;
  byLevel: {
    level: number;
    count: number;
    productCount: number;
  }[];
  topCategories: {
    id: number;
    name: string;
    productCount: number;
    childrenCount: number;
  }[];
}

/**
 * Category product distribution
 */
export interface CategoryProductDistribution {
  categoryId: number;
  categoryName: string;
  directProducts: number;
  childProducts: number;
  totalProducts: number;
  distribution: {
    categoryId: number;
    categoryName: string;
    level: number;
    productCount: number;
    percentage: number;
  }[];
}

/**
 * Category SEO analysis
 */
export interface CategorySeoAnalysis {
  categoryId: number;
  categoryName: string;
  hasMetaTitle: boolean;
  hasMetaDescription: boolean;
  hasDescription: boolean;
  hasUniqueSlug: boolean;
  slugQuality: "good" | "fair" | "poor";
  metaTitleLength: number;
  metaDescriptionLength: number;
  recommendations: {
    type: "missing" | "too_short" | "too_long" | "duplicate";
    field: string;
    message: string;
    priority: "high" | "medium" | "low";
  }[];
}

/**
 * Category comparison
 */
export interface CategoryComparison {
  categories: {
    id: number;
    name: string;
    level: number;
    productCount: number;
    activeProducts: number;
    childrenCount: number;
    active: boolean;
  }[];
  comparison: {
    field: string;
    values: Record<number, any>; // categoryId -> value
  }[];
}

/**
 * Category merge preview
 */
export interface CategoryMergePreview {
  sourceCategoryId: number;
  targetCategoryId: number;
  sourceName: string;
  targetName: string;
  productsToMove: number;
  childrenToMove: number;
  translationsToMerge: number;
  conflicts: {
    type: "duplicate_slug" | "duplicate_code" | "circular_reference";
    message: string;
    resolution: string;
  }[];
  canMerge: boolean;
}

/**
 * Category import/export format
 */
export interface CategoryImportExport {
  categories: {
    code: string;
    parentCode: string | null;
    level: number;
    position: number;
    active: boolean;
    translations: {
      languageCode: string;
      name: string;
      slug: string | null;
      description: string | null;
      linkRewrite: string | null;
      metaTitle: string | null;
      metaDescription: string | null;
    }[];
  }[];
}

/**
 * Category bulk operation result
 */
export interface CategoryBulkOperationResult {
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  errors: {
    categoryId: number;
    categoryName: string | null;
    message: string;
  }[];
  warnings: string[];
}

/**
 * Category navigation menu
 */
export interface CategoryNavigationMenu {
  id: number;
  name: string;
  slug: string | null;
  url: string;
  level: number;
  parentId: number | null;
  position: number;
  children: CategoryNavigationMenu[];
  hasChildren: boolean;
  productCount: number;
  isActive: boolean;
  isCurrent: boolean;
}

/**
 * Category filter options
 */
export interface CategoryFilterOptions {
  rootCategories: CategoryListItem[];
  availableDepths: number[];
  totalCategories: number;
  activeCategoriesCount: number;
  categoriesWithProducts: number;
}

/**
 * Category dashboard metrics
 */
export interface CategoryDashboardMetrics {
  totalCategories: number;
  activeCategories: number;
  rootCategories: number;
  maxTreeDepth: number;
  categoriesWithProducts: number;
  emptyCategories: number;
  recentlyAdded: CategoryListItem[];
  mostPopular: {
    id: number;
    name: string;
    productCount: number;
    trend: "up" | "down" | "stable";
  }[];
  seoIssues: {
    missingMetaTitle: number;
    missingMetaDescription: number;
    duplicateSlugs: number;
  };
  alerts: {
    type:
      | "empty_category"
      | "deep_nesting"
      | "missing_translation"
      | "seo_issue";
    severity: "high" | "medium" | "low";
    message: string;
    categoryIds: number[];
  }[];
}

/**
 * Category autocomplete suggestion
 */
export interface CategorySuggestion {
  id: number;
  code: string | null;
  name: string;
  slug: string | null;
  level: number;
  parentName: string | null;
  fullPath: string;
  productCount: number;
  relevance: number; // 0-1 score
}
