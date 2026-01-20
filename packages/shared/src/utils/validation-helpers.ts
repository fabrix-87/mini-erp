// packages/shared/src/utils/validation-helpers.ts
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
    .or(z.literal(""))
    .transform((val) => {
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
 * Schema per email normalizzato (Zod v4)
 */
export const emailSchema = (message?: string) => {
  return z
    .email(message || "Email non valida")
    .toLowerCase()
    .trim();
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

/**
 * Schema per numeri positivi
 */
export const positiveNumbersSchema = z.number().int().positive();

/**
 * Schema per telefono
 */
export const PhoneSchema = z
  .string()
  .max(20, "Telefono troppo lungo")
  .regex(/^[+]?[\d\s()-]*$/, "Formato telefono non valido")
  .optional()
  .nullable();

/**
 * Schema per URL (Zod v4)
 */
export const urlSchema = (required = false) => {
  const baseSchema = z.url("URL non valido");

  return required ? baseSchema : baseSchema.optional().nullable();
};

/**
 * Schema per UUID (Zod v4)
 */
export const uuidSchema = (required = false) => {
  const baseSchema = z.uuid("UUID non valido");

  return required ? baseSchema : baseSchema.optional().nullable();
};

/**
 * Schema per CUID (Zod v4)
 */
export const cuidSchema = (required = false) => {
  const baseSchema = z.cuid("CUID non valido");

  return required ? baseSchema : baseSchema.optional().nullable();
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
        const digits = vat.split("").map(Number);
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
      { message: "Partita IVA non valida" },
    );

  return required ? baseSchema : baseSchema.optional().nullable();
};

/**
 * Schema per codice fiscale italiano
 */
export const fiscalCodeSchema = (required = false) => {
  const baseSchema = z
    .string()
    .regex(
      /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/,
      "Formato codice fiscale non valido",
    )
    .length(16, "Il codice fiscale deve contenere 16 caratteri")
    .toUpperCase();

  return required ? baseSchema : baseSchema.optional().nullable();
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
    baseSchema = baseSchema.min(
      options.min,
      `Il prezzo minimo è ${options.min}`,
    );
  }

  if (options?.max !== undefined) {
    baseSchema = baseSchema.max(
      options.max,
      `Il prezzo massimo è ${options.max}`,
    );
  }

  return options?.required ? baseSchema : baseSchema.optional().nullable();
};

/**
 * Schema per Decimal(19, 2)
 */
export const CreditLimitSchema = z
  .union([
    z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Formato prezzo non valido (max 2 decimali)"),
    z.number(),
  ])
  .transform((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    // Arrotonda a 2 decimali per evitare problemi di precisione float
    return Math.round(num * 100) / 100;
  })
  .refine((val) => val >= 0, {
    message: "Il limite deve essere >= 0",
  })
  .refine(
    (val) => {
      // Verifica che non ci siano più di 2 decimali
      return (val * 100) % 1 < Number.EPSILON;
    },
    {
      message: "Massimo 2 decimali consentiti",
    },
  );

/**
 * Schema per percentuale (0-100)
 */
export const PercentageSchema = z
  .number()
  .min(0, "La percentuale non può essere negativa")
  .max(100, "La percentuale non può superare 100");

/**
 * Schema per direzione Ordinamento (asc, desc)
 */
export const sortOrderSchema = z.enum(["asc", "desc"]).default("asc");

/**
 * Schema per pagina paginazione
 */
export const pageSchema = z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val, 10) : 1));

/**
 * Schema per limite paginazione
 */
export const limitSchema = z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val, 10) : 20));

// Definisci uno schema compatibile con InputJsonValue di Prisma
export const InputJsonValueSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.record(z.string(), InputJsonValueSchema),
    z.array(InputJsonValueSchema),
  ]),
);

/**
 * Trasforma stringe "true"/"false" in booleani
 */
export const QueryBooleanSchema = z
  .enum(["true", "false"])
  .transform((val) => val === "true")
  .optional();

/**
 * // Helper per numeri sicuri da query string (gestisce stringa vuota e NaN)
 * @param errorMessage
 * @returns z.object
 */
export const queryNumberSchema = (errorMessage: string) =>
  z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z
      .unknown()
      .transform((val) => (val !== undefined ? Number(val) : undefined))
      .refine((val) => val === undefined || !isNaN(val), {
        message: errorMessage,
      }),
  );
