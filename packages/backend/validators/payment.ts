import { z } from 'zod';
import { handleZodError } from '../helpers/validate';

// ============================================================================
// ENUMS
// ============================================================================

export const TermTypeSchema = z.enum([
  'anticipated',
  'days_from_invoice',
  'end_of_month',
  'fixed_date',
]);

// ============================================================================
// PAYMENT METHOD SCHEMAS
// ============================================================================

/**
 * Schema per Payment Term Detail
 */
const PaymentTermDetailSchema = z.object({
  percentage: z
    .number()
    .min(0, 'Percentuale deve essere >= 0')
    .max(100, 'Percentuale deve essere <= 100'),

  termType: TermTypeSchema.default('days_from_invoice'),

  dueDays: z.number().int().nonnegative('dueDays deve essere >= 0').default(0),

  isEndOfMonth: z.boolean().default(false),

  isFixedDate: z.boolean().default(false),

  fixedDay: z
    .number()
    .int()
    .min(1, 'fixedDay deve essere >= 1')
    .max(31, 'fixedDay deve essere <= 31')
    .optional()
    .nullable(),

  fixedMonthOffset: z.number().int().nonnegative().default(0),

  position: z.number().int().nonnegative().default(0),
}).strict();

/**
 * Schema per Payment Method Translation
 */
const PaymentMethodTranslationSchema = z.object({
  languageId: z.number().int().positive('Language ID è obbligatorio'),

  name: z
    .string()
    .min(1, 'Nome traduzione è obbligatorio')
    .max(100, 'Nome traduzione non può superare 100 caratteri')
    .trim(),

  description: z.string().trim().optional(),
}).strict();

/**
 * Schema per la creazione di un Payment Method
 */
export const CreatePaymentMethodSchema = z
  .object({
    code: z
      .string()
      .min(1, 'Codice è obbligatorio')
      .max(50, 'Codice non può superare 50 caratteri')
      .trim(),

    active: z.boolean().default(true),

    position: z.number().int().nonnegative().default(0),

    translations: z
      .array(PaymentMethodTranslationSchema)
      .min(1, 'Almeno una traduzione è obbligatoria'),

    details: z.array(PaymentTermDetailSchema).optional(),
  })
  .strict()
  .refine(
    (data) => {
      // Se details è presente, verifica che le percentuali sommino a 100
      if (data.details && data.details.length > 0) {
        const totalPercentage = data.details.reduce(
          (sum, detail) => sum + detail.percentage,
          0
        );
        return Math.abs(totalPercentage - 100) < 0.01;
      }
      return true;
    },
    {
      message: 'La somma delle percentuali deve essere 100',
      path: ['details'],
    }
  );

/**
 * Schema per l'aggiornamento di un Payment Method
 */
export const UpdatePaymentMethodSchema = z
  .object({
    code: z
      .string()
      .min(1, 'Codice non può essere vuoto')
      .max(50, 'Codice non può superare 50 caratteri')
      .trim()
      .optional(),

    active: z.boolean().optional(),

    position: z.number().int().nonnegative().optional(),

    translations: z.array(PaymentMethodTranslationSchema).optional(),
  })
  .strict();

/**
 * Schema per aggiunta/aggiornamento Payment Term Details
 */
export const UpdatePaymentTermDetailsSchema = z
  .object({
    details: z.array(PaymentTermDetailSchema).min(1, 'Almeno un detail è obbligatorio'),
  })
  .strict()
  .refine(
    (data) => {
      const totalPercentage = data.details.reduce(
        (sum, detail) => sum + detail.percentage,
        0
      );
      return Math.abs(totalPercentage - 100) < 0.01;
    },
    {
      message: 'La somma delle percentuali deve essere 100',
      path: ['details'],
    }
  );

/**
 * Schema per calcolo scadenze
 */
export const CalculateDueDatesSchema = z.object({
  invoiceDate: z
    .string()
    .datetime()
    .optional()
    .or(z.date().optional())
    .transform((val) => (val ? new Date(val) : new Date())),

  totalAmount: z.number().positive('Total amount deve essere > 0'),
}).strict();

/**
 * Schema per ID parametri
 */
export const PaymentMethodIdSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: 'ID Payment Method non valido' }),
});

/**
 * Schema per query di ricerca
 */
export const PaymentQuerySchema = z
  .object({
    active: z
      .string()
      .optional()
      .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),

    sortBy: z.enum(['code', 'position', 'createdAt']).optional().default('position'),

    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  })
  .strict();

/**
 * Schema per toggle active status
 */
export const TogglePaymentStatusSchema = z.object({
  active: z.boolean({ error: 'Campo active è obbligatorio' }),
}).strict();

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Valida i dati per la creazione di un Payment Method
 */
export const validateCreatePaymentMethod = (data: unknown) => {
  try {
    return CreatePaymentMethodSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, 'Payment method creation');
    }
    throw error;
  }
};

/**
 * Valida i dati per l'aggiornamento di un Payment Method
 */
export const validateUpdatePaymentMethod = (data: unknown) => {
  try {
    return UpdatePaymentMethodSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, 'Payment method update');
    }
    throw error;
  }
};

/**
 * Valida i dati per aggiornamento Payment Term Details
 */
export const validateUpdatePaymentTermDetails = (data: unknown) => {
  try {
    return UpdatePaymentTermDetailsSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, 'Payment term details update');
    }
    throw error;
  }
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreatePaymentMethodInput = z.infer<typeof CreatePaymentMethodSchema>;
export type UpdatePaymentMethodInput = z.infer<typeof UpdatePaymentMethodSchema>;
export type UpdatePaymentTermDetailsInput = z.infer<typeof UpdatePaymentTermDetailsSchema>;
export type CalculateDueDatesInput = z.infer<typeof CalculateDueDatesSchema>;
export type PaymentQueryInput = z.infer<typeof PaymentQuerySchema>;
export type TogglePaymentStatusInput = z.infer<typeof TogglePaymentStatusSchema>;
export type TermType = z.infer<typeof TermTypeSchema>;
export type PaymentTermDetail = z.infer<typeof PaymentTermDetailSchema>;
export type PaymentMethodTranslation = z.infer<typeof PaymentMethodTranslationSchema>;