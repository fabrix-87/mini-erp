import z from "zod";
import {
  BaseCompanySchema,
  CompanyIdSchema,
  CompanyQueryBaseSchema,
  UpdateCompanySchema,
} from "./company";
import {
  CreditLimitSchema,
  QueryBooleanSchema,
  queryNumberSchema,
} from "../utils";

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
    leadTimeDays: z.number().int().nonnegative().default(0).optional(),

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

    transportCost: z.number().int().nonnegative().optional().nullable(),

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
  minRating: queryNumberSchema("Rating deve essere tra 1 e 5").pipe(
    z.number().min(1).max(5).optional(),
  ),
  maxRating: queryNumberSchema("Rating deve essere tra 1 e 5").pipe(
    z.number().min(1).max(5).optional(),
  ),
  hasProducts: QueryBooleanSchema,
  hasOrders: QueryBooleanSchema,

  minLeadTime: queryNumberSchema("Lead Time non valido").pipe(
    z.number().int().nonnegative().optional(),
  ),

  maxLeadTime: queryNumberSchema("Lead Time non valido").pipe(
    z.number().int().nonnegative().optional(),
  ),
  
});

/**
 * Schema per ID Supplier (riusa CompanyIdSchema)
 */
export const SupplierIdSchema = CompanyIdSchema;
