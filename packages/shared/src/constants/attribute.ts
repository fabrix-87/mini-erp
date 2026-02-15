// ============================================================================
// ATTRIBUTE CONSTANTS
// ============================================================================

/**
 * Attribute display types
 */
export const ATTRIBUTE_DISPLAY_TYPES = {
  SELECT: "SELECT",
  RADIO: "RADIO",
  COLOR: "COLOR",
  IMAGE: "IMAGE",
} as const;

/**
 * Attribute display type labels
 */
export const ATTRIBUTE_DISPLAY_TYPE_LABELS: Record<
  keyof typeof ATTRIBUTE_DISPLAY_TYPES,
  string
> = {
  SELECT: "Menu a tendina",
  RADIO: "Pulsanti radio",
  COLOR: "Selettore colore",
  IMAGE: "Selettore immagini",
};

// ============================================================================
// COMMON ATTRIBUTE GROUP CODES
// ============================================================================

/**
 * Common attribute group codes
 */
export const COMMON_ATTRIBUTE_GROUPS = {
  COLOR: "color",
  SIZE: "size",
  MATERIAL: "material",
  STYLE: "style",
  FINISH: "finish",
  CAPACITY: "capacity",
  WEIGHT: "weight",
} as const;

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Maximum attribute group code length
 */
export const MAX_ATTRIBUTE_GROUP_CODE_LENGTH = 50;

/**
 * Maximum attribute code length
 */
export const MAX_ATTRIBUTE_CODE_LENGTH = 50;

/**
 * Maximum attribute name length
 */
export const MAX_ATTRIBUTE_NAME_LENGTH = 128;

/**
 * Color hex pattern (with or without #)
 */
export const COLOR_HEX_PATTERN = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/**
 * PMS color pattern
 */
export const PMS_COLOR_PATTERN = /^PMS\s*\d+[A-Z]*$/i;

/**
 * Maximum image URL length
 */
export const MAX_IMAGE_URL_LENGTH = 500;

// ============================================================================
// SORTING OPTIONS
// ============================================================================

export const ATTRIBUTE_GROUP_SORT_OPTIONS = [
  "code",
  "position",
  "createdAt",
] as const;

export const ATTRIBUTE_SORT_OPTIONS = [
  "code",
  "position",
  "createdAt",
] as const;
