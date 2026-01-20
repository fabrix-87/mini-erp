import z from "zod";
import { limitSchema, pageSchema } from "../utils";

/**
 * Schema base per Code Country
 */
export const CountryCodeBaseSchema = z
    .string()
    .length(2, "Il country code deve essere di 2 caratteri")
    .regex(
      /^[A-Z]{2}$/,
      "Il country code deve contenere solo lettere maiuscole"
    )
    .trim()

/**
 * Schema per Code Country
 */
export const CountryCodeSchema = z.object({
  code: CountryCodeBaseSchema,
});

/**
 * Schema per Country
 */
export const CountrySchema = z.object({
  code: CountryCodeBaseSchema,
  name: z.string(),
  isEu: z.boolean(),
});

/**
 * Schema per Query Parameters Country
 */
export const CountryQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  isEU: z.enum(["true", "false"]).optional(),
});
