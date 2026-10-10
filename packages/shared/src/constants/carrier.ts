// ============================================================================
// CARRIER CONSTANTS
// ============================================================================

/** Placeholder replaced by Document.trackingNumber inside Carrier.trackingUrlTemplate. */
export const CARRIER_TRACKING_PLACEHOLDER = "{trackingNumber}" as const;

export const MAX_CARRIER_CODE_LENGTH = 20;
export const MAX_CARRIER_NAME_LENGTH = 100;
export const MAX_CARRIER_TRACKING_URL_LENGTH = 500;

/** Maximum carriers that can be linked to a single product. */
export const MAX_PRODUCT_CARRIERS = 100;

/** Upper-case business code (e.g. "BRT", "GLS-IT"). */
export const CARRIER_CODE_PATTERN = /^[A-Z0-9_-]+$/;

export const CARRIER_SORT_OPTIONS = ["code", "name", "position", "createdAt"] as const;
