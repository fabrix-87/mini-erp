// ============================================================================
// CATEGORY CONSTANTS
// ============================================================================

/**
 * Maximum category tree depth
 */
export const MAX_CATEGORY_DEPTH = 10;

/**
 * Maximum category code length
 */
export const MAX_CATEGORY_CODE_LENGTH = 50;

/**
 * Maximum category name length
 */
export const MAX_CATEGORY_NAME_LENGTH = 255;

/**
 * Maximum category slug length
 */
export const MAX_CATEGORY_SLUG_LENGTH = 255;

/**
 * Maximum category description length
 */
export const MAX_CATEGORY_DESCRIPTION_LENGTH = 10000;

/**
 * Maximum meta title length
 */
export const MAX_META_TITLE_LENGTH = 255;

/**
 * Maximum meta description length
 */
export const MAX_META_DESCRIPTION_LENGTH = 500;

/**
 * Slug pattern (URL-friendly)
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Category code pattern (alphanumeric with underscore and hyphen)
 */
export const CATEGORY_CODE_PATTERN = /^[a-zA-Z0-9_-]+$/;

// ============================================================================
// SORTING OPTIONS
// ============================================================================

export const CATEGORY_SORT_OPTIONS = [
  "name",
  "code",
  "position",
  "level",
  "createdAt",
  "updatedAt",
] as const;

// ============================================================================
// COMMON CATEGORY CODES
// ============================================================================

/**
 * Reserved category codes
 */
export const RESERVED_CATEGORY_CODES = [
  "root",
  "home",
  "all",
  "new",
  "sale",
  "featured",
] as const;

// ============================================================================
// CATEGORY TREE OPTIONS
// ============================================================================

/**
 * Maximum children to load per level in tree view
 */
export const MAX_TREE_CHILDREN_PER_LEVEL = 1000;

/**
 * Default tree expansion depth
 */
export const DEFAULT_TREE_EXPANSION_DEPTH = 2;
