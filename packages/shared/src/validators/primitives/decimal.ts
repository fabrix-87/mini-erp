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
    required?: string;
    min?: string;
    max?: string;
  };
};

/**
 * Schema factory for configurable-precision Decimal fields.
 * Supports optional defaultValue, positiveOnly, min/max constraints and custom messages.
 *
 * @param precision - Number of decimal places allowed (default: 2)
 * @param options   - DecimalSchemaOptions
 */
export const createDecimalSchema = (precision: number = 2, options?: DecimalSchemaOptions) => {
  return z
    .union([z.string(), z.number(), z.instanceof(Decimal)])
    .optional()
    .nullable()
    .transform((val, ctx) => {
      // ── Default value ───────────────────────────────────────────────────────
      if (val === null || val === undefined || val === "") {
        if (options?.defaultValue !== undefined) {
          try {
            return new Decimal(options.defaultValue);
          } catch {
            ctx.addIssue({
              code: "custom",
              message: "Default value non valido",
            });
            return z.NEVER;
          }
        }
        return undefined;
      }

      // ── Parse ───────────────────────────────────────────────────────────────
      try {
        return new Decimal(val as Decimal.Value);
      } catch {
        ctx.addIssue({
          code: "custom",
          message: options?.messages?.invalid ?? options?.error ?? "Valore decimale non valido",
        });
        return z.NEVER;
      }
    })
    .transform((val) => {
      if (!val) return val;
      return val.toDecimalPlaces(precision, options?.rounding ?? Decimal.ROUND_HALF_UP);
    })
    .refine((val) => !val || !options?.positiveOnly || !val.isNegative(), {
      message: options?.messages?.positive ?? "Il valore deve essere positivo",
    })
    .refine((val) => !val || options?.min === undefined || !val.lessThan(options.min), {
      message: options?.messages?.min ?? `Il valore deve essere almeno ${options?.min}`,
    })
    .refine((val) => !val || options?.max === undefined || !val.greaterThan(options.max), {
      message: options?.messages?.max ?? `Il valore non può superare ${options?.max}`,
    });
};

export const createDecimalSchemaRequired = (
  precision: number = 2,
  options?: DecimalSchemaOptions
) => {
  return z
    .union([z.string(), z.number(), z.instanceof(Decimal)])
    .transform((val, ctx) => {
      if (val === null || val === undefined || val === "") {
        if (options?.defaultValue !== undefined) {
          try {
            return new Decimal(options.defaultValue);
          } catch {
            ctx.addIssue({
              code: "custom",
              message: "Default value non valido",
            });
            return z.NEVER;
          }
        }

        ctx.addIssue({
          code: "custom",
          message: options?.messages?.required ?? "Valore obbligatorio",
        });
        return z.NEVER;
      }

      try {
        return new Decimal(val as Decimal.Value);
      } catch {
        ctx.addIssue({
          code: "custom",
          message:
            options?.messages?.invalid ??
            options?.error ??
            "Valore decimale non valido",
        });
        return z.NEVER;
      }
    })
    .transform((val) =>
      val.toDecimalPlaces(
        precision,
        options?.rounding ?? Decimal.ROUND_HALF_UP
      )
    )
    .refine((val) => !options?.positiveOnly || !val.isNegative(), {
      message: options?.messages?.positive ?? "Il valore deve essere positivo",
    })
    .refine(
      (val) => options?.min === undefined || !val.lessThan(options.min),
      {
        message:
          options?.messages?.min ??
          `Il valore deve essere almeno ${options?.min}`,
      }
    )
    .refine(
      (val) => options?.max === undefined || !val.greaterThan(options.max),
      {
        message:
          options?.messages?.max ??
          `Il valore non può superare ${options?.max}`,
      }
    );
};


/**
 * Calculates the sum of Decimal percentages
 */
export const sumPercentages = (details: Array<{ percentage: Decimal }>): Decimal => {
  return details.reduce((sum, detail) => sum.plus(detail.percentage), new Decimal(0));
};

/**
 * Checks if total percentage equals 100 with tolerance
 */
export const isValidPercentageTotal = (
  details: Array<{ percentage: Decimal }>,
  tolerance = 0.01,
): boolean => {
  const total = details.reduce((acc, d) => acc.plus(d.percentage), new Decimal(0));
  return total.minus(100).abs().lessThan(tolerance);
};
