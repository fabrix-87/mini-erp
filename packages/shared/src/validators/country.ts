import z from "zod";
import { limitSchema, pageSchema } from "../utils";
import { CountryCodeBaseSchema, CurrencyCodeBaseSchema } from "./base";

export const ContinentsEnum = z.enum([
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
]);

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
  iso3: z.string().max(3),
  numericCode: z.string().max(3),
  phoneCode: z.string().max(4),
  continent: ContinentsEnum,
  active: z.boolean().default(true),
  currencyCode: CurrencyCodeBaseSchema,
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
