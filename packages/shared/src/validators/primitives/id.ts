import { z } from "zod";

/**
 * Schema base per gli ID
 * @param errorMessage
 * @returns positive number
 */
export const createIdSchema = (errorMessage: string) =>
  z.preprocess(
    // 1. Se arriva una stringa vuota o null, la trasformiamo in undefined PRIMA di validare
    (val) => (val === "" || val === null ? undefined : val),

    // 2. Ora applichiamo la logica di conversione e validazione
    z
      .unknown()
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val), { message: errorMessage })
      .pipe(
        z
          .number()
          .int({ message: errorMessage })
          .positive({ message: errorMessage }),
      ),
  );

/**
 * Schema per numeri positivi
 */
export const positiveNumbersSchema = z.number().int().positive();
