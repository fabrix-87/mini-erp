// ============================================================================
// CUSTOMER SCHEMAS (Extended from Base)
// ============================================================================

import z from "zod";
import { BaseCompanySchema, CompanyIdSchema, CompanyQueryBaseSchema, UpdateCompanySchema } from "./company";
import { CreditLimitSchema } from "../utils";

// ============================================================================
// CUSTOMER-SPECIFIC ENUMS
// ============================================================================

export const CustomerTypeSchema = z.enum([
  "LEAD",
  "PROSPECT",
  "CUSTOMER",
  "PARTNER",
  "OTHER",
]);

export const CustomerPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const CustomerSegmentSchema = z.enum([
  "VIP",
  "GOLD",
  "SILVER",
  "BRONZE",
  "STANDARD",
]);

export const LeadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
]);

export const CreditCheckStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "IN_PROGRESS",
]);

export const CustomerSizeSchema = z.enum([
  "MICRO",
  "SMALL",
  "MEDIUM",
  "LARGE",
  "ENTERPRISE",
]);

/**
 * Schema per la creazione di un Customer
 * Estende BaseCompanySchema con dati CRM specifici
 */
export const CreateCustomerSchema = z
  .object({
    // Nested Company (usa il base schema)
    company: BaseCompanySchema,

    // ===== Dati CRM Specifici Customer =====
    type: CustomerTypeSchema.default("LEAD"),

    priority: CustomerPrioritySchema.default("MEDIUM"),

    segment: CustomerSegmentSchema.default("STANDARD"),

    leadStatus: LeadStatusSchema.default("NEW"),

    size: CustomerSizeSchema.default("SMALL"),

    creditStatus: CreditCheckStatusSchema.default("PENDING"),

    // ===== Dati Commerciali =====
    defaultPriceListId: z
      .number()
      .int("Price List ID deve essere un intero")
      .positive("Price List ID deve essere positivo")
      .optional()
      .nullable(),

    customerTaxRuleId: z
      .number()
      .int("Tax Rule ID deve essere un intero")
      .positive("Tax Rule ID deve essere positivo")
      .optional()
      .nullable(),

    paymentMethodId: z
      .number()
      .int("Payment Method ID deve essere un intero")
      .positive("Payment Method ID deve essere positivo")
      .optional()
      .nullable(),

    creditLimit: CreditLimitSchema.optional().nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento Customer
 * Solo dati CRM, NON modifica Company
 */
export const UpdateCustomerSchema = z
  .object({
    type: CustomerTypeSchema.optional(),
    priority: CustomerPrioritySchema.optional(),
    segment: CustomerSegmentSchema.optional(),
    leadStatus: LeadStatusSchema.optional(),
    size: CustomerSizeSchema.optional(),
    creditStatus: CreditCheckStatusSchema.optional(),

    defaultPriceListId: z.number().int().positive().optional().nullable(),

    customerTaxRuleId: z.number().int().positive().optional().nullable(),

    paymentMethodId: z.number().int().positive().optional().nullable(),

    creditLimit: CreditLimitSchema.optional().nullable(),
  })
  .strict();

/**
 * Schema per aggiornare solo la Company del Customer
 * Riusa UpdateCompanySchema dal base
 */
export const UpdateCustomerCompanySchema = UpdateCompanySchema;

/**
 * Schema per aggiornamento Lead Status con note
 */
export const UpdateLeadStatusSchema = z
  .object({
    leadStatus: LeadStatusSchema,
    notes: z
      .string()
      .max(1000, "Note non possono superare 1000 caratteri")
      .optional()
      .nullable(),
  })
  .strict();

/**
 * Schema per Query Parameters Customer
 * Estende CompanyQueryBaseSchema con filtri CRM
 */
export const CustomerQuerySchema = CompanyQueryBaseSchema.extend({
  // Filtri Customer-specific
  type: CustomerTypeSchema.optional(),
  priority: CustomerPrioritySchema.optional(),
  segment: CustomerSegmentSchema.optional(),
  leadStatus: LeadStatusSchema.optional(),
  creditStatus: CreditCheckStatusSchema.optional(),
  size: CustomerSizeSchema.optional(),

  // Filtri relazioni
  priceListId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),

  hasOrders: z.enum(["true", "false"]).optional(),
  hasOpportunities: z.enum(["true", "false"]).optional(),
});

/**
 * Schema per ID Customer (riusa CompanyIdSchema)
 */
export const CustomerIdSchema = CompanyIdSchema;