import { z } from "zod";

type DateStringOptions = {
  max?: Date;
  min?: Date;
  required?: boolean;
  message?: {
    max?: string;
    min?: string;
    required?: string;
  };
};

/**
 * Schema per date input da form che gestisce stringhe vuote
 */
export const dateStringSchema = (options?: DateStringOptions) => {
  let schema = z
    .string()
    .optional()
    .or(z.literal(""))
    .transform<Date | null>((val) => {
      if (!val || val.trim() === "") return null;
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    });

  if (options?.max) {
    schema = schema.refine((date) => !date || date <= options.max!, {
      message: options?.message?.max || "La data non può essere futura",
    });
  }

  if (options?.min) {
    schema = schema.refine((date) => !date || date >= options.min!, {
      message: options?.message?.min || "La data non è valida",
    });
  }

  if (options?.required) {
    schema = schema.refine((date) => date !== null, {
      message: options?.message?.required || "La data è obbligatoria",
    });
  }

  return schema.nullable();
};

/**
 * Schema for ISO date fields.
 * Accepts both full ISO datetime strings (API) and YYYY-MM-DD strings (HTML date inputs).
 * Transforms YYYY-MM-DD to a full ISO string at midnight UTC.
 *
 * @param options.required - If true, null/undefined are rejected
 * @param options.message  - Custom error message
 */
export function isoDateSchema(options: { required: true; message?: string }): z.ZodType<string>;
export function isoDateSchema(options?: { required?: false; message?: string }): z.ZodType<string | null | undefined>;
export function isoDateSchema(options?: { required?: boolean; message?: string }): z.ZodType<string> | z.ZodType<string | null | undefined> {
  const transform = z.string().transform((val, ctx) => {
    if (!val || val.trim() === "") return undefined;
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(val);
    const normalized = dateOnly ? `${val}T00:00:00.000Z` : val;
    const result = z.iso.datetime().safeParse(normalized);
    if (!result.success) {
      ctx.addIssue({ code: "custom", message: options?.message ?? "Data non valida" });
      return z.NEVER;
    }
    return normalized;
  });

  if (options?.required) {
    return z
      .string({ message: options.message ?? "Data obbligatoria" })
      .min(1, options.message ?? "Data obbligatoria")
      .pipe(transform) as z.ZodType<string>;
  }

  return transform.optional().nullable() as z.ZodType<string | null | undefined>;
}