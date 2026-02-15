import { z } from "zod";

/**
 * Trasforma stringe "true"/"false" in booleani
 */
export const queryBooleanSchema = z
  .enum(["true", "false"])
  .transform((val) => val === "true")
  .optional();

/**
 * Helper base per numeri da query string
 */
export const queryNumberSchema = (
  errorMessage: string = "Valore numerico non valido",
) =>
  z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : val,
    z
      .unknown()
      .transform((val) => (val !== undefined ? Number(val) : undefined))
      .refine((val) => val === undefined || !isNaN(val), {
        message: errorMessage,
      }),
  );

/**
 * Helper per numeri positivi da query string
 */
export const queryPositiveNumberSchema = (errorMessage?: string) =>
  queryNumberSchema(
    errorMessage ?? "Valore deve essere un numero valido",
  ).refine((val) => val === undefined || val >= 0, {
    message: errorMessage ?? "Valore deve essere >= 0",
  });

/**
 * Helper per percentuali da query string (0-100)
 */
export const queryPercentageSchema = (errorMessage?: string) =>
  queryNumberSchema(errorMessage ?? "Percentuale non valida")
    .transform((val) => (val !== undefined ? Math.round(val) : undefined))
    .refine((val) => val === undefined || (val >= 0 && val <= 100), {
      message: errorMessage ?? "Percentuale deve essere tra 0 e 100",
    });

/**
 * Helper per range di numeri da query string
 */
export const queryNumberRangeSchema = (
  min: number,
  max: number,
  errorMessage?: string,
) =>
  queryNumberSchema(errorMessage ?? "Valore non valido").refine(
    (val) => val === undefined || (val >= min && val <= max),
    {
      message: errorMessage ?? `Valore deve essere tra ${min} e ${max}`,
    },
  );
