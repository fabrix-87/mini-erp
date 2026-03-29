import { z } from "zod";

/**
 * Schema base per gli ID
 * @param errorMessage
 * @returns positive number
 */
/*
export const createIdSchema = (errorMessage: string) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((val, ctx) => {
      if (val === "" || val === null || val === undefined) {
        return undefined;
      }

      const num = Number(val);

      if (isNaN(num)) {
        ctx.addIssue({
          code: "custom",
          message: errorMessage,
        });
        return z.NEVER;
      }

      return num;
    })
    .refine((val) => val === undefined || Number.isInteger(val), {
      message: errorMessage,
    })
    .refine((val) => val === undefined || val > 0, {
      message: errorMessage,
    });
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
          message: errorMessage,
        });
        return z.NEVER;
      }

      return num;
    });

/**
 * Schema per numeri positivi
 */
export const positiveNumbersSchema = z.number().int().positive();
