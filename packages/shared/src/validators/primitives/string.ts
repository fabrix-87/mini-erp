import { z } from "zod";

/**
 * Schema per email normalizzato (Zod v4)
 */
export const emailSchema = (message?: string) => {
  return z
    .email(message || "Email non valida")
    .toLowerCase()
    .trim();
};

/**
 * Schema per telefono
 */
export const phoneSchema = z
  .string()
  .max(20, "Telefono troppo lungo")
  .regex(/^[+]?[\d\s()-]*$/, "Formato telefono non valido")

/**
 * Schema factory for URL fields.
 * Accepts empty strings from HTML inputs and normalizes them to null.
 *
 * @param required - If true, empty/null values are rejected
 * @param max      - Maximum URL length (default: 500)
 */
export const urlSchema = (required = false, max = 500) => {
  const baseSchema = z
    .union([z.url("URL non valido").max(max, `URL max ${max} caratteri`), z.literal("")])
    .transform((val) => (val === "" ? null : val));

  return required
    ? baseSchema.refine((val) => val !== null, { message: "URL obbligatorio" })
    : baseSchema.optional().nullable();
};

/**
 * Wraps a string schema to treat empty strings as null.
 * Useful for optional HTML text inputs that return "" instead of null.
 *
 * @param schema - The base z.string() schema to wrap
 */
export const emptyStringToNull = <T extends z.ZodType>(schema: T) =>
  z.union([schema, z.literal("")]).transform((val) => (val === "" ? null : val));
