// validators/dashboard.ts

import { z } from "zod";
import { validateBody, validateQuery } from "../middleware/validation";

// ============================================================================
// ENUMS
// ============================================================================

export const PeriodSchema = z.enum([
  "today",
  "yesterday",
  "last7days",
  "last30days",
  "last90days",
  "thisWeek",
  "lastWeek",
  "thisMonth",
  "lastMonth",
  "thisQuarter",
  "lastQuarter",
  "thisYear",
  "lastYear",
  "custom",
]);

export const GroupBySchema = z.enum(["day", "week", "month", "year"]);

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Schema base per date range
 */
export const DateRangeQuerySchema = z
  .object({
    startDate: z.iso
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),

    endDate: z.iso
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),

    period: PeriodSchema.optional().default("last30days"),
  })
  .strict();

// ============================================================================
// DASHBOARD QUERY SCHEMAS
// ============================================================================

/**
 * Query per overview dashboard
 */
export const OverviewQuerySchema = z.object({
  body: DateRangeQuerySchema,
});

/**
 * Query per statistiche vendite
 */
export const SalesQuerySchema = z.object({
  query: DateRangeQuerySchema.extend({
    customerId: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),

    assignedUserId: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),

    groupBy: GroupBySchema.optional().default("day"),
  }).strict(),
});

/**
 * Query per statistiche opportunità
 */
export const OpportunityQuerySchema = z
  .object({
    query: {
      assignedUserId: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined)),
    },
  })
  .strict();

/**
 * Query per statistiche prodotti
 */
export const ProductQuerySchema = z.object({
  query: DateRangeQuerySchema.extend({
    limit: z
      .string()
      .optional()
      .default("10")
      .transform((val) => parseInt(val, 10))
      .refine((val) => val >= 1 && val <= 100, {
        message: "Limit deve essere tra 1 e 100",
      }),

    categoryId: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
  }).strict(),
});

/**
 * Query per statistiche clienti
 */
export const CustomerQuerySchema = z.object({
  query: z
    .object({
      type: z
        .enum(["LEAD", "PROSPECT", "CUSTOMER", "PARTNER", "OTHER"])
        .optional(),
      segment: z
        .enum(["VIP", "GOLD", "SILVER", "BRONZE", "STANDARD"])
        .optional(),
    })
    .strict(),
});

/**
 * Query per statistiche documenti
 */
export const DocumentQuerySchema = z.object({
  query: DateRangeQuerySchema.extend({
    documentType: z
      .enum([
        "QUOTE",
        "PROFORMA",
        "ORDER",
        "DELIVERY_NOTE",
        "INVOICE",
        "CREDIT_NOTE",
        "DEBIT_NOTE",
        "SUPPLIER_ORDER",
      ])
      .optional(),

    status: z
      .enum([
        "DRAFT",
        "SENT",
        "ACCEPTED",
        "REJECTED",
        "UNPAID",
        "PARTIALLY_PAID",
        "PAID",
        "OVERDUE",
        "VOIDED",
      ])
      .optional(),
  }).strict(),
});

/**
 * Query per statistiche finanziarie
 */
export const FinancialQuerySchema = z.object({
  query: DateRangeQuerySchema,
});

/**
 * Query per statistiche magazzino
 */
export const WarehouseQuerySchema = z.object({
  query: z.object({
      warehouseId: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined)),
    })
    .strict(),
});

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateDashboardOverview = validateBody(
  OverviewQuerySchema,
  "Dashboard overview"
);

export const validateDashboardSales = validateQuery(
  SalesQuerySchema,
  "Sales statistics"
);

export const validateDashboardOpportunity = validateQuery(
  OpportunityQuerySchema,
  "Opportunity statistics"
);

export const validateDashboardProduct = validateQuery(
  ProductQuerySchema,
  "Products statistics"
);

export const validateDashboardCustomer = validateQuery(
  CustomerQuerySchema,
  "Customer statistics"
);

export const validateDashboardDocument = validateQuery(
  DocumentQuerySchema,
  "Document statistics"
);

export const validateDashboardFinancial = validateQuery(
  FinancialQuerySchema,
  "Financial statistics"
);

export const validateDashboardWarehouse = validateQuery(
  WarehouseQuerySchema,
  "Warehouse statistics"
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type PeriodType = z.infer<typeof PeriodSchema>;
export type GroupByType = z.infer<typeof GroupBySchema>;
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;
export type OverviewQuery = z.infer<typeof OverviewQuerySchema>["body"];
export type SalesQuery = z.infer<typeof SalesQuerySchema>["query"];
export type OpportunityQuery = z.infer<typeof OpportunityQuerySchema>["query"];
export type ProductQuery = z.infer<typeof ProductQuerySchema>["query"];
export type CustomerQuery = z.infer<typeof CustomerQuerySchema>["query"];
export type DocumentQuery = z.infer<typeof DocumentQuerySchema>["query"];
export type FinancialQuery = z.infer<typeof FinancialQuerySchema>["query"];
export type WarehouseQuery = z.infer<typeof WarehouseQuerySchema>["query"];
