import { z } from "zod";
import {
  baseCompanySchema,
  companyFiltersSchema,
  companyIdSchema,
  companyQueryBaseSchema,
  updateCompanySchema,
} from "./company";
import { creditLimitSchema } from "./business/currency";
import {
  queryBooleanOrAllSchema,
  queryBooleanSchema,
  queryNumberOrAllSchema,
  queryNumberSchema,
} from "./query/params";
import { createIdSchema } from "./primitives";
import { paginationSchema, sortOrderSchema } from "./query";

// ============================================================================
// SUPPLIER SCHEMAS (Extended from Base)
// ============================================================================

/**
 * Schema per la creazione di un Supplier
 * Estende BaseCompanySchema con dati Procurement specifici
 */
export const createSupplierSchema = z
  .object({
    // parent supplier (Hierarchy)
    parentSupplierId: createIdSchema("Parent Supplier ID non valido").optional().nullable(),

    // Nested Company (usa il base schema)
    company: baseCompanySchema,

    // ===== Dati Procurement Specifici Supplier =====
    paymentTerms: z
      .string()
      .max(100, "Payment terms non può superare 100 caratteri")
      .optional()
      .nullable(),

    creditLimit: creditLimitSchema.optional().nullable(),

    supplierTaxRuleId: createIdSchema("Tax Rule ID non valido").optional().nullable(),

    bankAccount: z
      .string()
      .max(100, "Bank account non può superare 100 caratteri")
      .optional()
      .nullable(),

    // ===== Logistica =====
    leadTimeDays: z.number().int().nonnegative().default(0).optional().nullable(),

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
      .optional()
      .nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento Supplier
 * Solo dati Procurement, NON modifica Company
 */
export const updateSupplierSchema = z
  .object({
    // parent supplier (Hierarchy)
    parentSupplierId: createIdSchema("Parent Supplier ID non valido").optional().nullable(),
    supplierTaxRuleId: createIdSchema("Tax Rule ID non valido").optional().nullable(),
    paymentTerms: z.string().max(100).optional().nullable(),
    creditLimit: creditLimitSchema.optional().nullable(),
    bankAccount: z.string().max(100).optional().nullable(),
    leadTimeDays: z.number().int().nonnegative().optional().nullable(),
    transportCost: z.number().nonnegative().optional().nullable(),
    rating: z.number().int().min(1).max(5).optional().nullable(),
  })
  .strict();

/**
 * Schema per aggiornare solo la Company del Supplier
 * Riusa UpdateCompanySchema dal base
 */
export const updateSupplierCompanySchema = updateCompanySchema;

export const supplierRatingSchema = z
  .number()
  .int("Rating deve essere un intero")
  .min(1, "Rating minimo è 1")
  .max(5, "Rating massimo è 5");

/**
 * Schema per aggiornamento Rating con note
 */
export const updateSupplierRatingSchema = z
  .object({
    rating: supplierRatingSchema,
    notes: z.string().max(1000, "Note non possono superare 1000 caratteri").optional().nullable(),
  })
  .strict();

export const supplierFiltersSchema = companyFiltersSchema.extend({
  // Filtri Supplier-specific

  // Supporta "all" per indicare nessun filtro
  minRating: queryNumberOrAllSchema("Rating deve essere tra 1 e 5").refine(
    (val) => val === undefined || (val >= 1 && val <= 5),
    { message: "Rating deve essere tra 1 e 5" },
  ),
  maxRating: queryNumberOrAllSchema("Rating deve essere tra 1 e 5").refine(
    (val) => val === undefined || (val >= 1 && val <= 5),
    { message: "Rating deve essere tra 1 e 5" },
  ),

  hasProducts: queryBooleanSchema.optional(),
  hasOrders: queryBooleanSchema.optional(),

  // Supporta "all" per indicare nessun filtro
  minLeadTime: queryNumberOrAllSchema("Lead Time non valido").refine(
    (val) => val === undefined || (Number.isInteger(val) && val >= 0),
    { message: "Lead Time non valido" },
  ),

  maxLeadTime: queryNumberOrAllSchema("Lead Time non valido").refine(
    (val) => val === undefined || (Number.isInteger(val) && val >= 0),
    { message: "Lead Time non valido" },
  ),
  isDeleted: queryBooleanOrAllSchema(),
});

/**
 * Schema per Query Parameters Supplier
 * Estende CompanyQueryBaseSchema con filtri Procurement
 */
export const supplierQuerySchema = z.object({
  ...supplierFiltersSchema.shape,
  ...paginationSchema.shape,
  sortBy: z.string().optional().default("id"),
  sortOrder: sortOrderSchema,
});

/**
 * Schema per ID Supplier (riusa CompanyIdSchema)
 */
export const supplierIdSchema = companyIdSchema;
