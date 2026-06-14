import { z } from "zod";
import { createCuidSchema } from "./primitives/id";

/**
 * Schema per validare ID utente
 */
export const userIdSchema = createCuidSchema("ID utente non valido");

/**
 * Schema base per Currency Code
 */
export const currencyCodeBaseSchema = z
  .string()
  .length(3, "Il currency code deve essere di 3 caratteri")
  .regex(/^[A-Z]{3}$/, "Il currency code deve contenere solo lettere maiuscole")
  .trim();

/**
 * Schema base per Code Country
 */
export const countryCodeBaseSchema = z
  .string()
  .length(2, "Il country code deve essere di 2 caratteri")
  .regex(/^[A-Z]{2}$/, "Il country code deve contenere solo lettere maiuscole")
  .trim();

// Definisci uno schema compatibile con InputJsonValue di Prisma
export const inputJsonValueSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.record(z.string(), inputJsonValueSchema),
    z.array(inputJsonValueSchema),
  ]),
);