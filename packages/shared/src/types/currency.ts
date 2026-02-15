import { z } from "zod";

import { Country } from "./country";
import Decimal from "decimal.js";
import {
  createCurrencySchema,
  currencyCodeSchema,
  currencyQuerySchema,
  currencyTranslationSchema,
} from "../validators/currency";

// Entities types
export type Currency = z.infer<typeof createCurrencySchema> & {
  id: number;
  exchangeRateUpdated: Date;
  countries: Country[];
  exchangeRateHistory: ExchangeRateHistory[];
  translations: CurrencyTranslation[];
};

export type ExchangeRateHistory = {
  id: number;
  currencyId: number;
  rate: number;
  date: Date;
  source: string;
};

export type Money = Decimal;

export type CurrencyTranslation = z.infer<typeof currencyTranslationSchema>;

// Input type
export type CreateCurrencyInput = z.infer<typeof createCurrencySchema>;

// Query type
export type CurrencyQueryInput = z.infer<typeof currencyQuerySchema>;

// Params type
export type CurrencyCodeParam = z.infer<typeof currencyCodeSchema>;
