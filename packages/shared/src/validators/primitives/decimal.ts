import Decimal from "decimal.js";
import { z } from "zod";

type DecimalSchemaOptions = {
  min?: Decimal.Value;
  max?: Decimal.Value;
  positiveOnly?: boolean;
  error?: string;
  rounding?: Decimal.Rounding; // modalità arrotondamento
  defaultValue?: Decimal.Value;
  messages?: {
    invalid?: string;
    positive?: string;
    min?: string;
    max?: string;
  };
};

/**
 * Schema factory per numeri decimali con precisione configurabile
 * @param precision - Numero di decimali consentiti (default: 2)
 * @param options - DecimalSchemaOptions - Opzioni di validazione
 */
export const createDecimalSchema = (
  precision: number = 2,
  options?: DecimalSchemaOptions,
) => {
  if (precision < 0 || !Number.isInteger(precision)) {
    throw new Error("Precision deve essere un intero non negativo");
  }

  const baseSchema = z
    .preprocess(
      (val) => {
        if (val === null || val === undefined || val === "") return undefined;
        try {
          return new Decimal(val as Decimal.Value);
        } catch {
          return val;
        }
      },
      z.instanceof(Decimal, {
        message: options?.messages?.invalid ?? "Valore decimale non valido",
      }),
    )
    .transform((val) =>
      val.toDecimalPlaces(
        precision,
        options?.rounding ?? Decimal.ROUND_HALF_UP,
      ),
    )
    .refine((val) => !options?.positiveOnly || !val.isNegative(), {
      message: options?.messages?.positive ?? "Il valore deve essere positivo",
    })
    .refine((val) => options?.min === undefined || !val.lessThan(options.min), {
      message: options?.messages?.min ?? 
        `Il valore deve essere almeno ${options?.min}`,
    })
    .refine(
      (val) => options?.max === undefined || !val.greaterThan(options.max),
      {
        message: options?.messages?.max ?? 
          `Il valore non può superare ${options?.max}`,
      },
    );

  // Applica default se specificato
  if (options?.defaultValue !== undefined) {
    return baseSchema.default(new Decimal(options.defaultValue));
  }

  return baseSchema;
};

/**
 * Calculates the sum of Decimal percentages
 */
const sumPercentages = (details: Array<{ percentage: Decimal }>): Decimal => {
  return details.reduce(
    (sum, detail) => sum.plus(detail.percentage),
    new Decimal(0),
  );
};

/**
 * Checks if total percentage equals 100 with tolerance
 */
export const isValidPercentageTotal = (
  details: Array<{ percentage: Decimal }>,
  tolerance = 0.01,
): boolean => {
  const total = sumPercentages(details);
  return total.minus(100).abs().lessThan(tolerance);
};