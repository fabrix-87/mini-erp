import { z } from "zod";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";

// Import Base Company Schemas
import {
  BaseCompanySchema,
  UpdateCompanySchema,
  CompanyQueryBaseSchema,
  CompanyIdSchema,
} from "./company";
import { CreditLimitSchema } from "../helpers/validate";

// ============================================================================
// SUPPLIER SCHEMAS (Extended from Base)
// ============================================================================

/**
 * Schema per la creazione di un Supplier
 * Estende BaseCompanySchema con dati Procurement specifici
 */
export const CreateSupplierSchema = z
  .object({
    // Nested Company (usa il base schema)
    company: BaseCompanySchema,

    // ===== Dati Procurement Specifici Supplier =====
    paymentTerms: z
      .string()
      .max(100, "Payment terms non può superare 100 caratteri")
      .optional()
      .nullable(),

    creditLimit: CreditLimitSchema.optional().nullable(),

    bankAccount: z
      .string()
      .max(100, "Bank account non può superare 100 caratteri")
      .optional()
      .nullable(),

    // ===== Logistica =====
    leadTimeDays: z
      .number()
      .int("Lead time deve essere un intero")
      .nonnegative("Lead time deve essere positivo o zero")
      .default(0)
      .optional(),

    transportCost: z
      .number()
      .nonnegative("Transport cost deve essere positivo o zero")
      .optional()
      .nullable(),

    // ===== Valutazione =====
    rating: z
      .number()
      .int("Rating deve essere un intero")
      .min(1, "Rating minimo è 1")
      .max(5, "Rating massimo è 5")
      .default(5)
      .optional(),
  })
  .strict();

/**
 * Schema per l'aggiornamento Supplier
 * Solo dati Procurement, NON modifica Company
 */
export const UpdateSupplierSchema = z
  .object({
    paymentTerms: z.string().max(100).optional().nullable(),

    creditLimit: CreditLimitSchema.optional().nullable(),

    bankAccount: z.string().max(100).optional().nullable(),

    leadTimeDays: z.number().int().nonnegative().optional(),

    transportCost: z.number().nonnegative().optional().nullable(),

    rating: z.number().int().min(1).max(5).optional(),
  })
  .strict();

/**
 * Schema per aggiornare solo la Company del Supplier
 * Riusa UpdateCompanySchema dal base
 */
export const UpdateSupplierCompanySchema = UpdateCompanySchema;

/**
 * Schema per aggiornamento Rating con note
 */
export const UpdateSupplierRatingSchema = z
  .object({
    rating: z
      .number()
      .int("Rating deve essere un intero")
      .min(1, "Rating minimo è 1")
      .max(5, "Rating massimo è 5"),

    notes: z
      .string()
      .max(1000, "Note non possono superare 1000 caratteri")
      .optional()
      .nullable(),
  })
  .strict();

/**
 * Schema per Query Parameters Supplier
 * Estende CompanyQueryBaseSchema con filtri Procurement
 */
export const SupplierQuerySchema = CompanyQueryBaseSchema.extend({
  // Filtri Supplier-specific
  minRating: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
    .refine((val) => val === undefined || (val >= 1 && val <= 5), {
      message: "Rating deve essere tra 1 e 5",
    }),

  maxRating: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
    .refine((val) => val === undefined || (val >= 1 && val <= 5), {
      message: "Rating deve essere tra 1 e 5",
    }),

  hasProducts: z
    .enum(["true", "false"])
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined
    ),

  hasOrders: z
    .enum(["true", "false"])
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined
    ),

  minLeadTime: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),

  maxLeadTime: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
});

/**
 * Schema per ID Supplier (riusa CompanyIdSchema)
 */
export const SupplierIdSchema = CompanyIdSchema;

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCreateSupplier = validateBody(
  CreateSupplierSchema,
  "Supplier creation"
);

export const validateUpdateSupplier = validateBody(
  UpdateSupplierSchema,
  "Supplier update"
);

export const validateUpdateSupplierCompany = validateBody(
  UpdateSupplierCompanySchema,
  "Supplier company update"
);

export const validateUpdateSupplierRating = validateBody(
  UpdateSupplierRatingSchema,
  "Supplier rating update"
);

export const validateSupplierId = validateParams(
  SupplierIdSchema,
  "Supplier ID"
);

export const validateSupplierQuery = validateQuery(
  SupplierQuerySchema,
  "Supplier query"
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>;
export type UpdateSupplierCompanyInput = z.infer<
  typeof UpdateSupplierCompanySchema
>;
export type UpdateSupplierRatingInput = z.infer<
  typeof UpdateSupplierRatingSchema
>;
