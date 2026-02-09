import { z } from "zod";
import {
  createDecimalSchema,
  createIdSchema,
  limitSchema,
  pageSchema,
  positiveNumbersSchema,
} from "../utils";
import { CountryCodeBaseSchema, CurrencyCodeBaseSchema } from "./base";

export const CurrencyCodeSchema = z.object({
  code: CurrencyCodeBaseSchema,
});

export const CreateCurrencySchema = z.object({
  code: CurrencyCodeBaseSchema,

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
  exchangeRate: createDecimalSchema(6, { positiveOnly: true }).default(1.0),

  // Provider tasso cambio
  exchangeRateSource: z.string().max(50).optional(),

  // stato
  active: z.boolean().default(true),

  // Metadata
  priority: positiveNumbersSchema.default(0),
  countryCode: CountryCodeBaseSchema.optional(),
});

export const CurrencyTranslationSchema = z.object({
  currencyId: createIdSchema("CurrencyId obbligatorio"),
  languageId: createIdSchema("LanguageId obbligatorio"),
  name: z.string("Nome valuta obbligatorio").max(100),
  namePlural: z.string("Nome plurale valuta obbligatorio").max(100),
});

export const CurrencyQuerySchema = z.object({
    search: z.string().optional().nullable(),
    page: pageSchema,
    limit: limitSchema,
})