// ============================================================================
// CUSTOMER SCHEMAS (Extended from Base)
// ============================================================================

import z from "zod";

import {
  baseCompanySchema,
  companyIdSchema,
  companyQueryBaseSchema,
  updateCompanySchema,
} from "./company";
import { queryBooleanSchema } from "./query/params";
import { createIdSchema } from "./primitives/id";
import { creditLimitSchema } from "./business/currency";

// ============================================================================
// CUSTOMER-SPECIFIC ENUMS
// ============================================================================

export const customerTypeSchema = z.enum([
  "LEAD",
  "PROSPECT",
  "CUSTOMER",
  "PARTNER",
  "OTHER",
]);

export const customerPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const customerSegmentSchema = z.enum([
  "VIP",
  "GOLD",
  "SILVER",
  "BRONZE",
  "STANDARD",
]);

export const leadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
]);

export const creditCheckStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "IN_PROGRESS",
]);

export const customerSizeSchema = z.enum([
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
export const createCustomerSchema = z
  .object({
    // Nested Company (usa il base schema)
    company: baseCompanySchema,

    // ===== Dati CRM Specifici Customer =====
    priority: customerPrioritySchema.default("MEDIUM"),
    segment: customerSegmentSchema.default("STANDARD"),
    leadStatus: leadStatusSchema.default("NEW"),
    size: customerSizeSchema.default("SMALL"),
    type: customerTypeSchema.default("LEAD"),
    creditStatus: creditCheckStatusSchema.default("PENDING"),

    // ===== Dati Commerciali =====
    defaultPriceListId: createIdSchema("Price List ID non valido")
      .optional()
      .nullable(),

    customerTaxRuleId: createIdSchema("Tax Rule ID non valido")
      .optional()
      .nullable(),

    paymentMethodId: createIdSchema("Payment Method ID non valido")
      .optional()
      .nullable(),

    creditLimit: creditLimitSchema.optional().nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento Customer
 * Solo dati CRM, NON modifica Company
 */
export const updateCustomerSchema = z
  .object({
    type: customerTypeSchema.optional(),
    priority: customerPrioritySchema.optional(),
    segment: customerSegmentSchema.optional(),
    leadStatus: leadStatusSchema.optional(),
    size: customerSizeSchema.optional(),
    creditStatus: creditCheckStatusSchema.optional(),

    defaultPriceListId: createIdSchema("Price List ID non valido")
      .optional()
      .nullable(),

    customerTaxRuleId: createIdSchema("Tax Rule ID non valido")
      .optional()
      .nullable(),

    paymentMethodId: createIdSchema("Payment Method ID non valido")
      .optional()
      .nullable(),

    creditLimit: creditLimitSchema.optional().nullable(),
  })
  .strict();

/**
 * Schema per aggiornare solo la Company del Customer
 * Riusa UpdateCompanySchema dal base
 */
export const updateCustomerCompanySchema = updateCompanySchema;

/**
 * Schema per aggiornamento Lead Status con note
 */
export const updateLeadStatusSchema = z
  .object({
    leadStatus: leadStatusSchema,
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
export const customerQuerySchema = companyQueryBaseSchema.extend({
  // Filtri Customer-specific
  type: customerTypeSchema.optional(),
  priority: customerPrioritySchema.optional(),
  segment: customerSegmentSchema.optional(),
  leadStatus: leadStatusSchema.optional(),
  creditStatus: creditCheckStatusSchema.optional(),
  size: customerSizeSchema.optional(),

  // Filtri relazioni
  priceListId: createIdSchema("PriceListId non valido").optional(),

  hasOrders: queryBooleanSchema.optional(),
  hasOpportunities: queryBooleanSchema.optional(),
});

/**
 * Schema per ID Customer (riusa CompanyIdSchema)
 */
export const customerIdSchema = companyIdSchema;
