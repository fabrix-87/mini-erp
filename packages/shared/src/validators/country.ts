import { z } from "zod";
import { queryBooleanSchema } from "./query/params";
import { limitSchema, pageSchema } from "./query/pagination";
import { countryCodeBaseSchema, currencyCodeBaseSchema } from "./base";

export const continentsEnum = z.enum([
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
export const countryCodeSchema = z.object({
  code: countryCodeBaseSchema,
});

/**
 * Schema per Country
 */
export const countrySchema = z.object({
  code: countryCodeBaseSchema,
  name: z.string(),
  isEu: z.boolean(),
  iso3: z.string().max(3),
  numericCode: z.string().max(3),
  phoneCode: z.string().max(4),
  continent: continentsEnum,
  active: z.boolean().default(true),
  currencyCode: currencyCodeBaseSchema,
});

/**
 * Schema per Query Parameters Country
 */
export const countryQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  isEU: queryBooleanSchema
});
