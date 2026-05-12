import Decimal from "decimal.js";
import { z } from "zod";

type DecimalSchemaOptions = {
  min?: Decimal.Value;
  max?: Decimal.Value;
  positiveOnly?: boolean;
  error?: string;
  rounding?: Decimal.Rounding;
  defaultValue?: Decimal.Value;
  required?: boolean;
  messages?: {
    invalid?: string;
    positive?: string;
    required?: string;
    min?: string;
    max?: string;
  };
};

export function createDecimalSchema(
  precision: number,
  options: DecimalSchemaOptions & { required: true }
): z.ZodType<Decimal>;
export function createDecimalSchema(
  precision?: number,
  options?: DecimalSchemaOptions & { required?: false }
): z.ZodType<Decimal | undefined>;
export function createDecimalSchema(
  precision: number = 2,
  options?: DecimalSchemaOptions
): z.ZodType<Decimal> | z.ZodType<Decimal | undefined> {
  const required = options?.required ?? false;

  const baseUnion = z.union([z.string(), z.number(), z.instanceof(Decimal)]);
  const input = required ? baseUnion : baseUnion.optional().nullable();

  const schema = (input as z.ZodType<unknown>)
    .transform((val, ctx) => {
      // ── Vuoto / assente ─────────────────────────────────────────────────────
      if (val === null || val === undefined || val === "") {
        if (options?.defaultValue !== undefined) {
          try {
            return new Decimal(options.defaultValue);
          } catch {
            ctx.addIssue({ code: "custom", message: "Default value non valido" });
            return z.NEVER;
          }
        }
        if (required) {
          ctx.addIssue({
            code: "custom",
            message: options?.messages?.required ?? "Valore obbligatorio",
          });
          return z.NEVER;
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
    .transform((val: Decimal | undefined) => {
      if (!val) return val;
      return val.toDecimalPlaces(precision, options?.rounding ?? Decimal.ROUND_HALF_UP);
    })
    .refine(
      (val: Decimal | undefined) => !val || !options?.positiveOnly || !val.isNegative(),
      { message: options?.messages?.positive ?? "Il valore deve essere positivo" }
    )
    .refine(
      (val: Decimal | undefined) => !val || options?.min === undefined || !val.lessThan(options.min),
      { message: options?.messages?.min ?? `Il valore deve essere almeno ${options?.min}` }
    )
    .refine(
      (val: Decimal | undefined) => !val || options?.max === undefined || !val.greaterThan(options.max),
      { message: options?.messages?.max ?? `Il valore non può superare ${options?.max}` }
    );

  return schema as z.ZodType<Decimal> | z.ZodType<Decimal | undefined>;
}


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
