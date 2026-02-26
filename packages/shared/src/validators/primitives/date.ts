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
 * Schema per date ISO (Zod v4)
 */
export const isoDateSchema = (options?: {
  required?: boolean;
  message?: string;
}) => {
  const baseSchema = z.iso.datetime(options?.message || "Data non valida");

  return options?.required === true
    ? baseSchema
    : baseSchema.optional().nullable();
};
