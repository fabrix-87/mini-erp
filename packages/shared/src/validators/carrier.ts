import { z } from "zod";
import { carrierIdBaseSchema, inputJsonValueSchema, supplierIdBaseSchema } from "./base";
import { emptyStringToNull } from "./primitives/string";
import { limitSchema, pageSchema, sortOrderSchema } from "./query/pagination";
import { queryBooleanOrAllSchema } from "./query/params";
import {
  CARRIER_CODE_PATTERN,
  CARRIER_SORT_OPTIONS,
  CARRIER_TRACKING_PLACEHOLDER,
  MAX_CARRIER_CODE_LENGTH,
  MAX_CARRIER_NAME_LENGTH,
  MAX_CARRIER_TRACKING_URL_LENGTH,
  MAX_PRODUCT_CARRIERS,
} from "../constants/carrier";

// ============================================================================
// SORT
// ============================================================================

export const carrierSortFieldSchema = z.enum(CARRIER_SORT_OPTIONS);

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/** Business code, unique per tenant among non-deleted carriers (uniqueness checked server-side). */
const carrierCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(1, "Codice corriere obbligatorio")
  .max(MAX_CARRIER_CODE_LENGTH, `Codice max ${MAX_CARRIER_CODE_LENGTH} caratteri`)
  .regex(CARRIER_CODE_PATTERN, "Codice può contenere solo lettere, numeri, underscore e trattini");

/** http(s) URL containing the {trackingNumber} placeholder. Empty string → null. */
const trackingUrlTemplateSchema = emptyStringToNull(
  z
    .string()
    .trim()
    .max(MAX_CARRIER_TRACKING_URL_LENGTH, `URL max ${MAX_CARRIER_TRACKING_URL_LENGTH} caratteri`)
    .regex(/^https?:\/\//i, "L'URL deve iniziare con http:// o https://")
    .refine((value) => value.includes(CARRIER_TRACKING_PLACEHOLDER), {
      message: `L'URL deve contenere il segnaposto ${CARRIER_TRACKING_PLACEHOLDER}`,
    }),
);

// ============================================================================
// BASE + CREATE / UPDATE
// ============================================================================

/**
 * Raw Carrier shape — intentionally WITHOUT defaults (active, position), so that the
 * update schema built from .partial() never resets them on a partial payload.
 */
const carrierShape = z.object({
  code: carrierCodeSchema,
  name: z
    .string()
    .trim()
    .min(1, "Nome corriere obbligatorio")
    .max(MAX_CARRIER_NAME_LENGTH, `Nome max ${MAX_CARRIER_NAME_LENGTH} caratteri`),
  /** Optional link when the carrier is also registered as a supplier. */
  supplierId: supplierIdBaseSchema.nullish(),
  trackingUrlTemplate: trackingUrlTemplateSchema.nullish(),
  position: z.number().int().nonnegative("Position non può essere negativa"),
  active: z.boolean(),
  customFields: inputJsonValueSchema.nullish(),
});

/** Schema for creating a Carrier. */
export const createCarrierSchema = carrierShape
  .extend({
    active: z.boolean().default(true),
    position: z.number().int().nonnegative("Position non può essere negativa").default(0),
  })
  .strict();

/** Schema for updating a Carrier — all fields optional, no defaults injected. */
export const updateCarrierSchema = carrierShape.partial().strict();

// ============================================================================
// ID PARAM
// ============================================================================

export const carrierIdParamSchema = z.object({
  id: carrierIdBaseSchema,
});

// ============================================================================
// QUERY
// ============================================================================

export const carrierQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().trim().optional(),
  active: queryBooleanOrAllSchema(),
  supplierId: supplierIdBaseSchema.optional(),
  isDeleted: queryBooleanOrAllSchema(),
  sortBy: carrierSortFieldSchema.default("position"),
  sortOrder: sortOrderSchema,
});

// ============================================================================
// SPECIAL SCHEMAS
// ============================================================================

export const toggleCarrierActiveSchema = z.object({ active: z.boolean() }).strict();

/**
 * Replaces the set of carriers eligible for a product.
 * An empty array removes every ProductCarrier row = no restriction (all active carriers allowed).
 */
export const setProductCarriersSchema = z
  .object({
    carrierIds: z
      .array(carrierIdBaseSchema)
      .max(MAX_PRODUCT_CARRIERS, `Massimo ${MAX_PRODUCT_CARRIERS} corrieri per prodotto`)
      .refine((ids) => new Set(ids).size === ids.length, { message: "Corrieri duplicati" }),
  })
  .strict();