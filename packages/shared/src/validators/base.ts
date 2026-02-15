import { z } from "zod";
import { createDecimalSchema, createIdSchema } from "../utils";
import Decimal from "decimal.js";

/**
 * Schema per validare ID utente
 */
export const UserIdSchema = createIdSchema("ID utente non valido");

/**
 * Schema base per Currency Code
 */
export const CurrencyCodeBaseSchema = z
  .string()
  .length(3, "Il currency code deve essere di 3 caratteri")
  .regex(/^[A-Z]{3}$/, "Il currency code deve contenere solo lettere maiuscole")
  .trim();

/**
 * Schema base per Code Country
 */
export const CountryCodeBaseSchema = z
  .string()
  .length(2, "Il country code deve essere di 2 caratteri")
  .regex(/^[A-Z]{2}$/, "Il country code deve contenere solo lettere maiuscole")
  .trim();

/**
 * Schema base per importi
 */
export const CurrencySchema = createDecimalSchema(2, {
  positiveOnly: true,
  min: 0,
});
