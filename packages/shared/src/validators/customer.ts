// ============================================================================
// CUSTOMER SCHEMAS (Extended from Base)
// ============================================================================

import { z } from "zod";

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

export const customerTypeSchema = z.enum(["PROSPECT", "CUSTOMER", "PARTNER", "OTHER"]);

export const customerPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const customerSegmentSchema = z.enum(["VIP", "GOLD", "SILVER", "BRONZE", "STANDARD"]);

export const creditCheckStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "IN_PROGRESS"]);

export const customerSizeSchema = z.enum(["MICRO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]);

/**
 * Schema per la creazione di un Customer.
 * Estende BaseCompanySchema con dati CRM specifici.
 * I dati fiscali della company NON sono obbligatori in questa fase:
 * possono essere completati in seguito tramite updateCustomerCompany.
 * La validazione fiscale completa avviene alla conferma dell'ordine.
 */
export const createCustomerSchema = z
  .object({
    // Nested Company (usa il base schema)
    company: baseCompanySchema,

    // parent customer (Hierarchy)
    parentCustomerId: createIdSchema("Parent Customer ID non valido").optional().nullable(),

    // ===== Dati CRM Specifici Customer =====
    priority: customerPrioritySchema.default("MEDIUM"),
    segment: customerSegmentSchema.default("STANDARD"),
    size: customerSizeSchema.default("SMALL"),
    type: customerTypeSchema.default("CUSTOMER"),
    creditStatus: creditCheckStatusSchema.default("PENDING"),

    // ===== Dati Commerciali =====
    defaultPriceListId: createIdSchema("Price List ID non valido").optional().nullable(),

    customerTaxRuleId: createIdSchema("Tax Rule ID non valido").optional().nullable(),

    paymentMethodId: createIdSchema("Payment Method ID non valido").optional().nullable(),

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
    size: customerSizeSchema.optional(),
    creditStatus: creditCheckStatusSchema.optional(),

    defaultPriceListId: createIdSchema("Price List ID non valido").optional().nullable(),

    customerTaxRuleId: createIdSchema("Tax Rule ID non valido").optional().nullable(),

    paymentMethodId: createIdSchema("Payment Method ID non valido").optional().nullable(),

    // parent customer (Hierarchy)
    parentCustomerId: createIdSchema("Parent Customer ID non valido").optional().nullable(),

    creditLimit: creditLimitSchema.optional().nullable(),
  })
  .strict();

/**
 * Schema per aggiornare solo la Company del Customer
 * Riusa UpdateCompanySchema dal base
 */
export const updateCustomerCompanySchema = updateCompanySchema;

/**
 * Schema per Query Parameters Customer
 * Estende CompanyQueryBaseSchema con filtri CRM
 */
export const customerQuerySchema = companyQueryBaseSchema.extend({
  // Filtri Customer-specific
  type: customerTypeSchema.optional(),
  priority: customerPrioritySchema.optional(),
  segment: customerSegmentSchema.optional(),
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
