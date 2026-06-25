import { z } from "zod";

import { Country } from "./country";
import Decimal from "decimal.js";
import {
  createCurrencyRateSchema,
  createCurrencySchema,
  createExchangeRateHistorySchema,
  currencyCodeSchema,
  currencyQuerySchema,
  currencySortFieldSchema,
  currencyTranslationSchema,
} from "../validators/currency";


// Entities types
export type Currency = z.infer<typeof createCurrencySchema> & {
  id: number;
  exchangeRateUpdated: Date;
  countries: Country[];
  exchangeRateHistory: ExchangeRateHistory[];
  translations: CurrencyTranslation[];
  currentRatesFromBase: CurrencyCurrentRate[];
  createdAt: Date;
  updatedAt: Date;
};

export type ExchangeRateHistory = {
  id: number;
  currencyId: number;
  rate: number;
  date: Date;
  source: string;
};

export type CurrencyCurrentRate = {
  id: number;
  currencyId: number;
  rate: Decimal | string;
  effectiveAt: Date;
  source?: string | null;
};

export type Money = Decimal;

export const CURRENCY_SORT_FIELDS: Readonly<Set<CurrencySortField>> = new Set(
  currencySortFieldSchema.options,
);
export type CurrencySortField = z.infer<typeof currencySortFieldSchema>;

export type CurrencyTranslation = z.infer<typeof currencyTranslationSchema> & {
  language: {
    name: string;
  }
};

// Input type
export type CreateCurrencyInput = z.infer<typeof createCurrencySchema>;
export type CreateCurrencyRateInput = z.infer<typeof createCurrencyRateSchema>;
export type CreateExchangeRateHistory = z.infer<typeof createExchangeRateHistorySchema>;

// Query type
export type CurrencyQueryInput = z.infer<typeof currencyQuerySchema>;

// Params type
export type CurrencyCodeParam = z.infer<typeof currencyCodeSchema>;
