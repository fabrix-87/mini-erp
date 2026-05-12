import { z } from "zod";

/**
 * Schema for sort order query string parameters.
 * Accepts `"asc"` or `"desc"` and defaults to `"asc"` when the value is absent.
 *
 * @example
 * sortOrderSchema.parse("desc")    // → "desc"
 * sortOrderSchema.parse(undefined) // → "asc"
 */
export const sortOrderSchema = z.enum(["asc", "desc"]).default("asc");

/**
 * Schema for pagination page query string parameters.
 * Parses the string as a base-10 integer and defaults to `1` when the value is absent.
 *
 * @example
 * pageSchema.parse("3")       // → 3
 * pageSchema.parse(undefined) // → 1
 */
export const pageSchema = z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val, 10) : 1));

/**
 * Schema for pagination limit query string parameters.
 * Parses the string as a base-10 integer and defaults to `20` when the value is absent.
 *
 * @example
 * limitSchema.parse("50")     // → 50
 * limitSchema.parse(undefined) // → 20
 */
export const limitSchema = z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val, 10) : 20));
