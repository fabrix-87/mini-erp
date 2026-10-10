import Decimal from "decimal.js";
import { z } from "zod";
import {
  MAX_DISCOUNT_PERCENT,
  MAX_DOCUMENT_AMOUNT,
  MAX_LINE_QUANTITY,
  MIN_DISCOUNT_PERCENT,
} from "../../constants";

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

/** Raw value accepted by decimal schemas (form input / JSON payload). */
type DecimalRawInput = string | number;

/**
 * Builds a Zod schema that validates and rounds a decimal value using decimal.js
 * and emits a fixed-precision **string** (e.g. "12.50").
 *
 * The output is a plain string so it can safely cross the Server Action /
 * HTTP boundary. Convert to `Decimal` on the backend with {@link toDecimal}
 * (or pass the string directly to Prisma, which accepts it for Decimal fields).
 *
 * @param precision - Number of decimal places (default 2)
 * @param options - Validation options (min, max, positiveOnly, rounding, messages...)
 * @returns Zod schema: required → `string`, optional → `string | undefined`
 */
export function createDecimalSchema(
  precision: number,
  options: DecimalSchemaOptions & { required: true },
): z.ZodType<string, DecimalRawInput>;
export function createDecimalSchema(
  precision?: number,
  options?: DecimalSchemaOptions & { required?: false },
): z.ZodType<string | undefined, DecimalRawInput | null | undefined>;
export function createDecimalSchema(
  precision: number = 2,
  options?: DecimalSchemaOptions,
):
  | z.ZodType<string, DecimalRawInput>
  | z.ZodType<string | undefined, DecimalRawInput | null | undefined> {
  const required = options?.required ?? false;
  const rounding = options?.rounding ?? Decimal.ROUND_HALF_UP;

  const baseUnion = z.union([z.string(), z.number()]);
  const input = required ? baseUnion : baseUnion.optional().nullable();

  const schema = (input as z.ZodType<DecimalRawInput | null | undefined>).transform(
    (val, ctx): string | undefined => {
      // ── Empty / missing ─────────────────────────────────────────────────
      const isEmpty =
        val === null || val === undefined || (typeof val === "string" && val.trim() === "");

      if (isEmpty) {
        if (options?.defaultValue !== undefined) {
          try {
            return new Decimal(options.defaultValue)
              .toDecimalPlaces(precision, rounding)
              .toFixed(precision);
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

      // ── Parse (accepts "1,50" as well as "1.50") ────────────────────────
      let parsed: Decimal;
      try {
        const raw = typeof val === "string" ? val.trim().replace(",", ".") : val;
        parsed = new Decimal(raw as DecimalRawInput);
        if (!parsed.isFinite()) throw new Error("Not a finite number");
      } catch {
        ctx.addIssue({
          code: "custom",
          message: options?.messages?.invalid ?? options?.error ?? "Valore decimale non valido",
        });
        return z.NEVER;
      }

      const value = parsed.toDecimalPlaces(precision, rounding);

      // ── Constraints ─────────────────────────────────────────────────────
      if (options?.positiveOnly && value.isNegative()) {
        ctx.addIssue({
          code: "custom",
          message: options?.messages?.positive ?? "Il valore deve essere positivo",
        });
      }
      if (options?.min !== undefined && value.lessThan(options.min)) {
        ctx.addIssue({
          code: "custom",
          message: options?.messages?.min ?? `Il valore deve essere almeno ${options.min}`,
        });
      }
      if (options?.max !== undefined && value.greaterThan(options.max)) {
        ctx.addIssue({
          code: "custom",
          message: options?.messages?.max ?? `Il valore non può superare ${options.max}`,
        });
      }

      return value.toFixed(precision);
    },
  );

  return schema as
    | z.ZodType<string, DecimalRawInput>
    | z.ZodType<string | undefined, DecimalRawInput | null | undefined>;
}

/**
 * Converts a validated decimal string (output of createDecimalSchema) to a Decimal.
 * Use it server-side (controller/service) when calculations are needed.
 * @param value - Decimal string, or undefined/null
 * @returns Decimal instance, or undefined when the value is empty
 */
export const toDecimal = (value: string | null | undefined): Decimal | undefined =>
  value === null || value === undefined || value === "" ? undefined : new Decimal(value);

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
  details: Array<{ percentage: string }>,
  tolerance = 0.01,
): boolean => {
  const total = details.reduce((acc, d) => acc.plus(d.percentage), new Decimal(0));
  return total.minus(100).abs().lessThan(tolerance);
};

/**
 * Coerces Decimal/string values from API into number for form fields.
 * Zod v4 compatible — uses z.pipe instead of deprecated z.preprocess.
 */
export const toNumberSchema = (options?: { min?: number; required?: boolean }) => {
  const coerced = z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val): number | null | undefined => {
      if (val == null || val === "") return null;
      const n = Number(val);
      return isNaN(n) ? undefined : n;
    });

  if (options?.required) {
    return coerced.pipe(z.number({ error: "Inserire un valore numerico" }).min(options?.min ?? 0));
  }

  return coerced.pipe(
    z
      .number({ error: "Inserire un valore numerico" })
      .min(options?.min ?? 0)
      .optional()
      .nullable(),
  );
};

/**
 * Wraps an optional decimal schema so that an explicit `null` survives parsing.
 *
 * `createDecimalSchema` turns `null` into `undefined`, so a PATCH sending `null` on a
 * nullable column would look like "field not provided" and never clear the value.
 * The union tries `null` first, then falls back to the decimal schema.
 *
 * Output: `string | null | undefined` (undefined = not provided, null = clear the value).
 *
 * @param schema - A schema returned by createDecimalSchema
 * @returns Schema that preserves `null` and keeps the key optional
 * @example
 * const withholdingPercent = nullableDecimalSchema(createDecimalSchema(2, { min: 0, max: 100 }));
 */
export const nullableDecimalSchema = <T extends z.ZodType>(schema: T) =>
  z.union([z.null(), schema]).optional();

// ============================================================================
// DOCUMENT HELPERS
// ============================================================================
// "Optional" variants have NO default: they are used in the shapes reused by update
// schemas, so that .partial() never injects values the client did not send.
// Defaults are re-applied only in create schemas via .extend().

const moneyOptions = { positiveOnly: true, min: 0, max: MAX_DOCUMENT_AMOUNT } as const;
export const moneyOptionalSchema = createDecimalSchema(2, moneyOptions);
export const moneySchema = createDecimalSchema(2, { ...moneyOptions, defaultValue: 0 });

/** Unit amounts match Decimal(20,6) in Prisma (unitPrice, unitCost, originalUnitPrice). */
const unitAmountOptions = { positiveOnly: true, min: 0 } as const;
export const unitAmountOptionalSchema = createDecimalSchema(6, unitAmountOptions);
export const unitAmountSchema = createDecimalSchema(6, { ...unitAmountOptions, defaultValue: 0 });

const quantityOptions = { positiveOnly: true, min: 0, max: MAX_LINE_QUANTITY } as const;
export const quantityOptionalSchema = createDecimalSchema(6, quantityOptions);
export const quantitySchema = (defaultValue: number) =>
  createDecimalSchema(6, { ...quantityOptions, defaultValue });

const discountOptions = {
  positiveOnly: true,
  min: MIN_DISCOUNT_PERCENT,
  max: MAX_DISCOUNT_PERCENT,
} as const;
export const discountPercentOptionalSchema = createDecimalSchema(2, discountOptions);
export const discountPercentSchema = createDecimalSchema(2, {
  ...discountOptions,
  defaultValue: 0,
});

const percentOptions = { positiveOnly: true, min: 0, max: 100 } as const;
export const percentOptionalSchema = createDecimalSchema(2, percentOptions);
export const taxPercentSchema = createDecimalSchema(2, {
  ...percentOptions,
});
export const exchangeRateSchema = createDecimalSchema(6, { positiveOnly: true, min: 0 });
