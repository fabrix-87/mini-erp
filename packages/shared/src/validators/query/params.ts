import { z } from "zod";

/**
 * Schema for boolean query string parameters.
 * Accepts `"true"` or `"false"` strings and transforms them to native booleans.
 * `null` and `undefined` are coerced to `undefined`.
 *
 * @example
 * queryBooleanSchema.parse("true")    // → true
 * queryBooleanSchema.parse("false")   // → false
 * queryBooleanSchema.parse(undefined) // → undefined
 */
export const queryBooleanSchema = z
  .enum(["true", "false"])
  .optional()
  .nullable()
  .transform((val) => {
    if (val === null || val === undefined) return undefined;
    return val === "true";
  });

/**
 * Base schema factory for numeric query string parameters.
 * Converts a string to a number, returning `undefined` for empty, `null`, or `undefined` inputs.
 *
 * @param errorMessage - Custom error message when the value cannot be parsed as a number.
 *                       Defaults to `"Valore numerico non valido"`.
 *
 * @example
 * queryNumberSchema().parse("42")        // → 42
 * queryNumberSchema().parse("")          // → undefined
 * queryNumberSchema().parse("abc")       // → ZodError
 */
export const queryNumberSchema = (errorMessage = "Valore numerico non valido") =>
  z
    .string()
    .optional()
    .nullable()
    .transform((val, ctx) => {
      if (val === null || val === undefined || val.trim() === "") return undefined;
      const n = Number(val);
      if (isNaN(n)) {
        ctx.addIssue({ code: "custom", message: errorMessage });
        return z.NEVER;
      }
      return n;
    });

/**
 * Schema factory for non-negative numeric query string parameters.
 * Builds on {@link queryNumberSchema} and adds a `>= 0` constraint.
 *
 * @param messages.invalid  - Error message when the value cannot be parsed as a number.
 * @param messages.positive - Error message when the value is negative.
 *                            Defaults to `"Valore deve essere >= 0"`.
 *
 * @example
 * queryPositiveNumberSchema().parse("10")  // → 10
 * queryPositiveNumberSchema().parse("-1")  // → ZodError (positive message)
 * queryPositiveNumberSchema().parse("abc") // → ZodError (invalid message)
 */
export const queryPositiveNumberSchema = (messages?: { invalid?: string; positive?: string }) =>
  queryNumberSchema(messages?.invalid).refine((val) => val === undefined || val >= 0, {
    message: messages?.positive ?? "Valore deve essere >= 0",
  });

/**
 * Schema factory for percentage query string parameters.
 * Parses the value as a number, rounds it to the nearest integer,
 * and validates it falls within the `[0, 100]` range.
 *
 * @param messages.invalid - Error message when the value cannot be parsed as a number.
 * @param messages.range   - Error message when the value is outside `[0, 100]`.
 *                           Defaults to `"Percentuale deve essere tra 0 e 100"`.
 *
 * @example
 * queryPercentageSchema().parse("75.6") // → 76
 * queryPercentageSchema().parse("101")  // → ZodError (range message)
 */
export const queryPercentageSchema = (messages?: { invalid?: string; range?: string }) =>
  queryNumberSchema(messages?.invalid)
    .transform((val) => (val !== undefined ? Math.round(val) : undefined))
    .refine((val) => val === undefined || (val >= 0 && val <= 100), {
      message: messages?.range ?? "Percentuale deve essere tra 0 e 100",
    });

/**
 * Schema factory for bounded numeric query string parameters.
 * Parses the value as a number and validates it falls within the `[min, max]` range (inclusive).
 *
 * @param min              - Lower bound (inclusive).
 * @param max              - Upper bound (inclusive).
 * @param messages.invalid - Error message when the value cannot be parsed as a number.
 * @param messages.range   - Error message when the value is outside `[min, max]`.
 *                           Defaults to `"Valore deve essere tra {min} e {max}"`.
 *
 * @example
 * queryNumberRangeSchema(1, 5).parse("3")  // → 3
 * queryNumberRangeSchema(1, 5).parse("6")  // → ZodError (range message)
 */
export const queryNumberRangeSchema = (
  min: number,
  max: number,
  messages?: {
    invalid?: string;
    range?: string;
  },
) =>
  queryNumberSchema(messages?.invalid).refine(
    (val) => val === undefined || (val >= min && val <= max),
    { message: messages?.range ?? `Valore deve essere tra ${min} e ${max}` },
  );
