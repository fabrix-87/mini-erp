import z from "zod";
import { validateParams, validateQuery } from "../middleware/validation";

/**
 * Schema per ID Country
 */
export const CountryCodeSchema = z.object({
  code: z
    .string()
    .length(2, "Il country code deve essere di 2 caratteri")
    .regex(
      /^[A-Z]{2}$/,
      "Il country code deve contenere solo lettere maiuscole"
    )
    .trim(),
});

/**
 * Schema per Query Parameters Country
 */
const CountryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(300).default(20),
  search: z.string().optional(),
  isEU: z.enum(["true", "false"]).optional(),
});

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCountryQuery = validateQuery(
  CountryQuerySchema,
  "Country query"
);

export const validateCountryCode = validateParams(
  CountryCodeSchema,
  "Country code"
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CountryQueryInput = z.infer<typeof CountryQuerySchema>;
export type CountryCodeInput = z.infer<typeof CountryCodeSchema>;
