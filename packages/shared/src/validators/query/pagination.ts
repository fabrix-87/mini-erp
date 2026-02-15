import { z } from "zod";

/**
 * Schema per direzione Ordinamento (asc, desc)
 */
export const sortOrderSchema = z.enum(["asc", "desc"]).default("asc");

/**
 * Schema per pagina paginazione
 */
export const pageSchema = z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val, 10) : 1));

/**
 * Schema per limite paginazione
 */
export const limitSchema = z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val, 10) : 20));
