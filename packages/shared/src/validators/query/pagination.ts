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

/**
 * Schema for sort order query string parameters.
 * Accepts `"asc"` or `"desc"` strings.
 * `null`, `undefined`, and empty strings fall back to the default value.
 *
 * @param defaultValue - Default sort order. Defaults to `"asc"`.
 *
 * @example
 * querySortOrderSchema().parse("asc")       // → "asc"
 * querySortOrderSchema().parse("desc")      // → "desc"
 * querySortOrderSchema().parse(undefined)   // → "asc"
 * querySortOrderSchema().parse("")          // → "asc"
 * querySortOrderSchema("desc").parse(null)  // → "desc"
 * querySortOrderSchema().parse("foo")       // → ZodError
 */
export const querySortOrderSchema = (defaultValue: "asc" | "desc" = "asc") =>
  z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val.trim() === "") return defaultValue;
      return val.trim().toLowerCase();
    })
    .refine((val): val is "asc" | "desc" => val === "asc" || val === "desc", {
      message: 'sortOrder must be "asc" or "desc"',
    });
