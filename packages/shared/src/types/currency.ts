import { z } from "zod";
import {
  CreateCurrencySchema,
  CurrencyCodeSchema,
  CurrencyQuerySchema,
  CurrencyTranslationSchema,
} from "../validators/currency";
import { Country } from "./country";
import Decimal from "decimal.js";

// Entities types
export type Currency = z.infer<typeof CreateCurrencySchema> & {
  id: number;
  exchangeRateUpdated: Date;
  countries: Country[];
  exchangeRateHistory: ExchangeRateHistory[];
  translations: CurrencyTranslation[]
};

export type ExchangeRateHistory = {
  id: number;
  currencyId: number;
  rate: number;
  date: Date;
  source: string;
};

export type Money = Decimal;

export type CurrencyTranslation = z.infer<typeof CurrencyTranslationSchema>;

// Input type
export type CreateCurrencyInput = z.infer<typeof CreateCurrencySchema>

// Query type
export type CurrencyQueryInput = z.infer<typeof CurrencyQuerySchema>

// Params type
export type CurrencyCodeParam = z.infer<typeof CurrencyCodeSchema>