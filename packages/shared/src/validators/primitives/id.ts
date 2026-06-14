import { isCuid } from "@paralleldrive/cuid2";
import { z } from "zod";

/**
 * Schema base per gli ID
 * @param errorMessage
 * @returns positive number
 */
export const createIdSchema = (errorMessage: string) =>
  z
    .union([z.string(), z.number()]) // input accettabile da form
    .transform((val, ctx) => {
      // converti stringa in numero
      const num = Number(val);

      if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
        ctx.addIssue({
          code: "custom",
          error: errorMessage,
        });
        return z.NEVER;
      }

      return num;
    });

/**
 * Creates a Zod schema that validates a CUID2 string identifier.
 *
 * @param errorMessage - Custom error message shown when the value is not a valid CUID2
 * @returns A Zod schema that accepts and validates CUID2 strings
 * @example
 * const userIdSchema = createCuidSchema("Invalid user ID");
 * userIdSchema.parse("clh2xcnm50000a8z33bvlbgi8"); // ✅
 * userIdSchema.parse("not-a-cuid");                 // ❌ throws
 */
export const createCuidSchema = (errorMessage: string) =>
  z.string().refine((val) => isCuid(val), {
    error: errorMessage,
  });

/**
 * Schema per numeri positivi
 */
export const positiveNumbersSchema = z.number().int().positive();
