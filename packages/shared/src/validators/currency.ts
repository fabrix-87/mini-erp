import { z } from "zod";
import { countryCodeBaseSchema, currencyCodeBaseSchema } from "./base";
import { createIdSchema, positiveNumbersSchema } from "./primitives/id";
import { createDecimalSchema } from "./primitives/decimal";
import { limitSchema, pageSchema, querySortOrderSchema } from "./query/pagination";
import { queryBooleanSchema } from "./query/params";

/**
 * Allowed sort fields for currencies list queries.
 */
export const currencySortFieldSchema = z.enum([
  "code",
  "createdAt",
  "updatedAt",
  "symbol",
  "numericCode",
  "isBaseCurrency",
  "priority",
]);

export const currencyCodeSchema = z.object({
  code: currencyCodeBaseSchema,
});

export const createCurrencySchema = z.object({
  code: currencyCodeBaseSchema,

  numericCode: z.string().length(3).optional(),

  // Identificazione
  symbol: z.string("Simbolo valuta obbligatorio").max(10),
  symbolNative: z.string().max(10).optional(),

  minorUnit: positiveNumbersSchema.default(2),
  rounding: createDecimalSchema(4, { required: true, defaultValue: 0 }),

  isBaseCurrency: z.boolean().default(false), // vero solo per valuta base

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
  search: z.string().optional(),
  page: pageSchema,
  limit: limitSchema,
  active: queryBooleanSchema.optional(),
  numericCode: z.string().length(3).optional(),
  isBaseCurrency: queryBooleanSchema.optional(),
  sortBy: currencySortFieldSchema.optional(),
  sortOrder: querySortOrderSchema("desc").optional(),
});

/**
 * Schema for creating/updating the current exchange rate snapshot for a currency.
 * Rate is expressed from the system base currency to this currency.
 */
export const createCurrencyRateSchema = z.object({
  currencyId: createIdSchema("CurrencyId obbligatorio"),
  rate: createDecimalSchema(8, { positiveOnly: true }),
  effectiveAt: z.coerce.date(),
  source: z.string().max(50).optional(),
});

export const createExchangeRateHistorySchema = z.object({
  currencyId: createIdSchema("CurrencyId obbligatorio"),
  rate: createDecimalSchema(8, { positiveOnly: true }),
  effectiveAt: z.coerce.date(),
  source: z.string().max(50).optional(),
  batchKey: z.string().max(100).optional(),
});