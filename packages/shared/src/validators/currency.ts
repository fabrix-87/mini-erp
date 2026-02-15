import { z } from "zod";
import { countryCodeBaseSchema, currencyCodeBaseSchema } from "./base";
import { createIdSchema, positiveNumbersSchema } from "./primitives/id";
import { createDecimalSchema } from "./primitives/decimal";
import { limitSchema, pageSchema } from "./query/pagination";
import { queryBooleanSchema } from "./query/params";

export const currencyCodeSchema = z.object({
  code: currencyCodeBaseSchema,
});

export const createCurrencySchema = z.object({
  code: currencyCodeBaseSchema,

  // Identificazione
  symbol: z.string("Simbolo valuta obbligatorio").max(10),
  symbolNative: z.string("Simbolo nativo valuta obbligatorio").max(10),

  // formattazione
  decimalDigits: positiveNumbersSchema.default(2),
  rounding: createDecimalSchema(4, { positiveOnly: true }),
  symbolPosition: z.enum(["before", "after"]).default("before"),
  decimalSeparator: z.enum([",", "."]).default(","),
  thousandSeparator: z.enum([",", "."]).default("."),

  // tasso di cambio (verso valuta base)
  isBaseCurrency: z.boolean().default(false), // vero solo per valuta base
  exchangeRate: createDecimalSchema(6, {
    positiveOnly: true,
    defaultValue: 1.0,
  }),

  // Provider tasso cambio
  exchangeRateSource: z.string().max(50).optional(),

  // stato
  active: z.boolean().default(true),

  // Metadata
  priority: positiveNumbersSchema.default(0),
  countryCode: countryCodeBaseSchema.optional(),
});

export const currencyTranslationSchema = z.object({
  currencyId: createIdSchema("CurrencyId obbligatorio"),
  languageId: createIdSchema("LanguageId obbligatorio"),
  name: z.string("Nome valuta obbligatorio").max(100),
  namePlural: z.string("Nome plurale valuta obbligatorio").max(100),
});

export const currencyQuerySchema = z.object({
  search: z.string().optional().nullable(),
  page: pageSchema,
  limit: limitSchema,
  active: queryBooleanSchema,
});
