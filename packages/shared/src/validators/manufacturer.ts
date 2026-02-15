import { z } from "zod";
import { inputJsonValueSchema } from "./base";
import { createIdSchema } from "./primitives";
import {
  limitSchema,
  pageSchema,
  queryBooleanSchema,
  sortOrderSchema,
} from "./query";

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Schema per validare ID Manufacturer
 */
export const manufacturerIdSchema = createIdSchema(
  "ID Manufacturer non valido",
);

/**
 * Schema for creating Manufacturer
 */
export const createManufacturerSchema = z.object({
  name: z.string(),
  active: z.boolean().default(true),
  customFields: inputJsonValueSchema.optional().nullable(),
});

/**
 * Schema for updating Manufacturer
 */
export const updateManufacturerSchema = createManufacturerSchema
  .partial()
  .strict();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const manufacturerQuerySchema = z.object({
  name: z.string(),
  active: queryBooleanSchema,
  page: pageSchema,
  limit: limitSchema,
  sortOrder: sortOrderSchema,
  sortBy: z.enum(["id", "name", "createdAt"]).default("id"),
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const manufacturerIdParamSchema = z.object({
  id: manufacturerIdSchema,
});
