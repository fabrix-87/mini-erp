// packages/shared/src/utils/validation-helpers.ts
import Decimal from "decimal.js";
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
 * Schema factory per numeri decimali con precisione configurabile
 * @param precision - Numero di decimali consentiti (default: 2)
 * @param options - DecimalSchemaOptions - Opzioni di validazione
 */
type DecimalSchemaOptions = {
  min?: Decimal.Value;
  max?: Decimal.Value;
  positiveOnly?: boolean;
  error?: string;
  rounding?: Decimal.Rounding; // modalità arrotondamento
  messages?: {
    invalid?: string;
    positive?: string;
    min?: string;
    max?: string;
  };
};

export const createDecimalSchema = (
  precision: number = 2,
  options?: DecimalSchemaOptions,
) => {
  if (precision < 0 || !Number.isInteger(precision)) {
    throw new Error("Precision deve essere un intero non negativo");
  }

  return z
    .preprocess(
      (val) => {
        if (val === null || val === undefined || val === "") {
          return undefined;
        }
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
      message:
        options?.messages?.min ??
        `Il valore deve essere almeno ${options?.min}`,
    })
    .refine(
      (val) => options?.max === undefined || !val.greaterThan(options.max),
      {
        message:
          options?.messages?.max ??
          `Il valore non può superare ${options?.max}`,
      },
    );
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
  precision?: number; // Opzionale: per override dei decimali (default: 2)
}) => {
  return createDecimalSchema(options?.precision ?? 2, {
    positiveOnly: true,
    min: options?.min ?? 0,
    max: options?.max,
    error:
      options?.min !== undefined
        ? `Il prezzo deve essere compreso tra ${options.min} e ${options.max ?? "∞"}`
        : "Il prezzo deve essere positivo",
  });
};

/**
 * Schema per Decimal(19, 2)
 */
export const CreditLimitSchema = createDecimalSchema(2, {
  min: 0,
});

/**
 * Schema per percentuale (0-100)
 */
export const PercentageSchema = createDecimalSchema(2, {
  min: 0,
  max: 100,
});

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
