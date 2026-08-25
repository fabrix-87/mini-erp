import { z } from "zod";
import { createCuidSchema } from "./primitives/id";

/**
 * Entity ID Base Schemas
*/
export const userIdSchema = createCuidSchema("ID utente non valido");
export const companyIdBaseSchema = createCuidSchema("Company ID non valido");
export const customerIdBaseSchema = createCuidSchema("Customer ID non valido");
export const leadIdBaseSchema = createCuidSchema("ID Lead non valido");
export const opportunityIdBaseSchema  = createCuidSchema("ID Opportunity non valido");
export const productIdBaseSchema = createCuidSchema("ID Product non valido");


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