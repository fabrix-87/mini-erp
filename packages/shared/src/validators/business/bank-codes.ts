import { z } from "zod";
import { isValidIban, normalizeIban } from "../../helpers/bank";
import { BIC_PATTERN, IBAN_MAX_LENGTH, IBAN_MIN_LENGTH } from "../../constants/bank";
import { emptyStringToNull } from "../primitives/string";

/**
 * IBAN schema. Normalizes the input (spaces removed, upper-case) and validates structure,
 * Italian length and the mod-97 checksum. Emits the compact IBAN.
 */
export const ibanSchema = z
  .string({ error: "IBAN obbligatorio" })
  .transform(normalizeIban)
  .pipe(
    z
      .string()
      .min(IBAN_MIN_LENGTH, "IBAN troppo corto")
      .max(IBAN_MAX_LENGTH, "IBAN troppo lungo")
      .refine(isValidIban, { message: "IBAN non valido" }),
  );

/**
 * BIC/SWIFT schema (8 or 11 characters). Empty string becomes null and an explicit
 * null is preserved, so a PATCH can clear the value.
 */
export const bicSchema = emptyStringToNull(
  z.string().trim().toUpperCase().regex(BIC_PATTERN, "BIC/SWIFT non valido (8 o 11 caratteri)"),
).nullish();
