// packages/shared/src/utils/validation-helpers.ts
import { z } from 'zod';

/**
 * Schema per date input da form che gestisce stringhe vuote
 */
export const dateStringSchema = (options?: {
  max?: Date;
  min?: Date;
  required?: boolean;
  message?: {
    max?: string;
    min?: string;
    required?: string;
  };
}) => {
  let schema = z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((val) => {
      if (!val || val.trim() === '') return null;
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    });

  if (options?.max) {
    schema = schema.refine(
      (date) => !date || date <= options.max!,
      { message: options?.message?.max || "La data non può essere futura" }
    );
  }

  if (options?.min) {
    schema = schema.refine(
      (date) => !date || date >= options.min!,
      { message: options?.message?.min || "La data non è valida" }
    );
  }

  if (options?.required) {
    schema = schema.refine(
      (date) => date !== null,
      { message: options?.message?.required || "La data è obbligatoria" }
    );
  }

  return schema.nullable();
};

/**
 * Schema per email normalizzato (Zod v4)
 */
export const emailSchema = (options?: {
  required?: boolean;
  message?: string;
}) => {
  const baseSchema = z.email(options?.message || "Email non valida").toLowerCase().trim();
  
  return options?.required 
    ? baseSchema 
    : baseSchema.optional();
};

/**
 * Schema per date ISO (Zod v4)
 */
export const isoDateSchema = (options?: {
  required?: boolean;
  message?: string;
}) => {
  const baseSchema = z.iso.datetime(options?.message || "Data non valida");
  
  return options?.required 
    ? baseSchema 
    : baseSchema.optional().nullable();
};

/**
 * Schema per telefono
 */
export const phoneSchema = (options?: {
  required?: boolean;
  international?: boolean;
}) => {
  const pattern = options?.international 
    ? /^[+]?[\d\s()-]*$/
    : /^[+]?39[\s]?[\d\s()-]*$/;
  
  const baseSchema = z
    .string()
    .regex(pattern, "Formato telefono non valido")
    .max(20, "Telefono troppo lungo");
  
  return options?.required 
    ? baseSchema 
    : baseSchema.optional().nullable();
};

/**
 * Schema per URL (Zod v4)
 */
export const urlSchema = (required = false) => {
  const baseSchema = z.url("URL non valido");
  
  return required 
    ? baseSchema 
    : baseSchema.optional().nullable();
};

/**
 * Schema per UUID (Zod v4)
 */
export const uuidSchema = (required = false) => {
  const baseSchema = z.uuid("UUID non valido");
  
  return required 
    ? baseSchema 
    : baseSchema.optional().nullable();
};

/**
 * Schema per CUID (Zod v4)
 */
export const cuidSchema = (required = false) => {
  const baseSchema = z.cuid("CUID non valido");
  
  return required 
    ? baseSchema 
    : baseSchema.optional().nullable();
};

/**
 * Schema per partita IVA italiana
 */
export const vatNumberSchema = (required = false) => {
  const baseSchema = z
    .string()
    .regex(/^[0-9]{11}$/, "Partita IVA deve contenere 11 cifre")
    .refine(
      (vat) => {
        if (vat.length !== 11) return false;
        const digits = vat.split('').map(Number);
        let sum = 0;
        for (let i = 0; i < 11; i++) {
          if (i % 2 === 0) {
            sum += digits[i];
          } else {
            const doubled = digits[i] * 2;
            sum += doubled > 9 ? doubled - 9 : doubled;
          }
        }
        return sum % 10 === 0;
      },
      { message: "Partita IVA non valida" }
    );
  
  return required 
    ? baseSchema 
    : baseSchema.optional().nullable();
};

/**
 * Schema per codice fiscale italiano
 */
export const fiscalCodeSchema = (required = false) => {
  const baseSchema = z
    .string()
    .regex(
      /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/,
      "Formato codice fiscale non valido"
    )
    .length(16, "Il codice fiscale deve contenere 16 caratteri")
    .toUpperCase();
  
  return required 
    ? baseSchema 
    : baseSchema.optional().nullable();
};

/**
 * Schema per prezzo/importo
 */
export const priceSchema = (options?: {
  min?: number;
  max?: number;
  required?: boolean;
}) => {
  let baseSchema = z.number().positive("Il prezzo deve essere positivo");
  
  if (options?.min !== undefined) {
    baseSchema = baseSchema.min(options.min, `Il prezzo minimo è ${options.min}`);
  }
  
  if (options?.max !== undefined) {
    baseSchema = baseSchema.max(options.max, `Il prezzo massimo è ${options.max}`);
  }
  
  return options?.required 
    ? baseSchema 
    : baseSchema.optional().nullable();
};

/**
 * Schema per percentuale (0-100)
 */
export const percentageSchema = (required = false) => {
  const baseSchema = z
    .number()
    .min(0, "La percentuale non può essere negativa")
    .max(100, "La percentuale non può superare 100");
  
  return required 
    ? baseSchema 
    : baseSchema.optional().nullable();
};
