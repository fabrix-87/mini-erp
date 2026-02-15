// ============================================================================
// WAREHOUSE CONSTANTS
// ============================================================================

/**
 * Warehouse types
 */
export const WAREHOUSE_TYPES = {
  PHYSICAL: "PHYSICAL",
  VIRTUAL: "VIRTUAL",
} as const;

/**
 * Movement types
 */
export const MOVEMENT_TYPES = {
  PURCHASE: "PURCHASE",
  SALE: "SALE",
  RETURN_IN: "RETURN_IN",
  RETURN_OUT: "RETURN_OUT",
  ADJUSTMENT: "ADJUSTMENT",
  TRANSFER_IN: "TRANSFER_IN",
  TRANSFER_OUT: "TRANSFER_OUT",
  INVENTORY_START: "INVENTORY_START",
} as const;

/**
 * Movement status
 */
export const MOVEMENT_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;

/**
 * Virtual sync status
 */
export const VIRTUAL_SYNC_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
} as const;

/**
 * Stock batch status
 */
export const STOCK_BATCH_STATUS = {
  ACTIVE: "active",
  QUARANTINE: "quarantine",
  EXPIRED: "expired",
} as const;

/**
 * Stock reservation status
 */
export const STOCK_RESERVATION_STATUS = {
  ACTIVE: "active",
  FULFILLED: "fulfilled",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

// ============================================================================
// MOVEMENT TYPE LABELS (i18n keys or display labels)
// ============================================================================

export const MOVEMENT_TYPE_LABELS: Record<
  keyof typeof MOVEMENT_TYPES,
  string
> = {
  PURCHASE: "Acquisto da fornitore",
  SALE: "Vendita a cliente",
  RETURN_IN: "Reso da cliente",
  RETURN_OUT: "Reso a fornitore",
  ADJUSTMENT: "Rettifica inventario",
  TRANSFER_IN: "Trasferimento in entrata",
  TRANSFER_OUT: "Trasferimento in uscita",
  INVENTORY_START: "Inventario iniziale",
};

/**
 * Movement type directions (for stock calculation)
 */
export const MOVEMENT_TYPE_DIRECTION: Record<
  keyof typeof MOVEMENT_TYPES,
  "IN" | "OUT"
> = {
  PURCHASE: "IN",
  SALE: "OUT",
  RETURN_IN: "IN",
  RETURN_OUT: "OUT",
  ADJUSTMENT: "IN", // Can be both, depends on quantity sign
  TRANSFER_IN: "IN",
  TRANSFER_OUT: "OUT",
  INVENTORY_START: "IN",
};

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Maximum quantity allowed in a single movement
 */
export const MAX_MOVEMENT_QUANTITY = 1000000;

/**
 * Minimum quantity allowed in a single movement
 */
export const MIN_MOVEMENT_QUANTITY = -1000000;

/**
 * Maximum batch number length
 */
export const MAX_BATCH_NUMBER_LENGTH = 50;

/**
 * Maximum serial number length
 */
export const MAX_SERIAL_NUMBER_LENGTH = 50;

/**
 * Default reservation expiry time (in minutes)
 */
export const DEFAULT_RESERVATION_EXPIRY_MINUTES = 30;

/**
 * Maximum lead time days for virtual stock
 */
export const MAX_LEAD_TIME_DAYS = 365;

/**
 * Sync retry attempts for virtual stock
 */
export const VIRTUAL_STOCK_SYNC_RETRY_ATTEMPTS = 3;

// ============================================================================
// STOCK LEVEL THRESHOLDS
// ============================================================================

/**
 * Stock level severity thresholds (percentage)
 */
export const STOCK_LEVEL_THRESHOLDS = {
  CRITICAL: 10, // <= 10% of reorder level
  LOW: 25, // <= 25% of reorder level
  WARNING: 50, // <= 50% of reorder level
  ADEQUATE: 100, // > 50% of reorder level
} as const;

/**
 * Stock status based on quantity
 */
export const STOCK_STATUS = {
  OUT_OF_STOCK: "OUT_OF_STOCK",
  CRITICAL: "CRITICAL",
  LOW: "LOW",
  WARNING: "WARNING",
  ADEQUATE: "ADEQUATE",
  OVERSTOCKED: "OVERSTOCKED",
} as const;

// ============================================================================
// WAREHOUSE OPERATIONS
// ============================================================================

/**
 * Operations that require stock confirmation
 */
export const OPERATIONS_REQUIRING_CONFIRMATION = [
  MOVEMENT_TYPES.SALE,
  MOVEMENT_TYPES.RETURN_OUT,
  MOVEMENT_TYPES.TRANSFER_OUT,
];

/**
 * Operations that increase stock
 */
export const OPERATIONS_INCREASING_STOCK = [
  MOVEMENT_TYPES.PURCHASE,
  MOVEMENT_TYPES.RETURN_IN,
  MOVEMENT_TYPES.TRANSFER_IN,
  MOVEMENT_TYPES.INVENTORY_START,
];

/**
 * Operations that decrease stock
 */
export const OPERATIONS_DECREASING_STOCK = [
  MOVEMENT_TYPES.SALE,
  MOVEMENT_TYPES.RETURN_OUT,
  MOVEMENT_TYPES.TRANSFER_OUT,
];

// ============================================================================
// SORTING OPTIONS
// ============================================================================

export const WAREHOUSE_SORT_OPTIONS = [
  "name",
  "location",
  "type",
  "createdAt",
] as const;

export const STOCK_MOVEMENT_SORT_OPTIONS = [
  "movementDate",
  "quantity",
  "movementType",
  "status",
  "createdAt",
] as const;

export const STOCK_BATCH_SORT_OPTIONS = [
  "batchNumber",
  "expiryDate",
  "quantity",
  "status",
  "manufacturedDate",
] as const;
