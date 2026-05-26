// packages/shared/src/validators/forms/company-form.ts
import { z } from "zod";

import { countryCodeBaseSchema, inputJsonValueSchema, userIdSchema } from "../base";
import { createIdSchema } from "../primitives/id";
import {
  eoriNumberSchema,
  fiscalCodeSchema,
  internationalVatIdSchema,
  sdiCodeSchema,
  vatNumberSchema,
} from "../business/italian-codes";
import { emailSchema, phoneSchema } from "../primitives/string";
import { companyStatusSchema, companyTypeEntitySchema } from "../company";
import {
  customerTypeSchema,
  customerPrioritySchema,
  customerSegmentSchema,
  creditCheckStatusSchema,
  customerSizeSchema,
} from "../customer";
import { supplierRatingSchema } from "../supplier";
import { createNestedAddressSchema } from "../address";
import { toOptionalField } from "../utils";

/**
 * Flat Zod schema for the company form UI.
 * Combines company base fields + customer-specific + supplier-specific fields.
 * All entity-specific fields are optional/nullable to support both modes.
 * This schema is UI-driven (flat shape) and is NOT the API contract.
 * Use company-mapper.ts to transform into the appropriate API payload.
 */
export const companyFormSchema = z.object({
  // ── Company base ──────────────────────────────────────────────
  companyName: z
    .string()
    .min(1, "La ragione sociale è obbligatoria")
    .max(255, "Il nome non può superare 255 caratteri")
    .trim(),
  tradeName: z.string().max(255).optional().nullable(),
  legalForm: z.string().max(100).optional().nullable(),
  status: companyStatusSchema.default("ACTIVE"),
  entityType: companyTypeEntitySchema.default("JURIDICAL"),

  vatNumber: vatNumberSchema(),
  taxCode: fiscalCodeSchema(),
  sdiCode: sdiCodeSchema(),
  pec: toOptionalField(emailSchema()),
  vatId: internationalVatIdSchema(),
  eoriNumber: eoriNumberSchema(),

  countryCode: countryCodeBaseSchema.default("IT"),
  mainEmail: emailSchema().optional().nullable(),
  mainPhone: phoneSchema.optional().nullable(),
  assignedUserId: userIdSchema.optional().nullable(),
  customFields: inputJsonValueSchema.optional().nullable(),

  legalAddress: createNestedAddressSchema,

  // ── Customer fields ───────────────────────────────────────────
  parentCustomerId: createIdSchema("Parent Customer ID non valido").optional().nullable(),
  priority: customerPrioritySchema.default("MEDIUM"),
  segment: customerSegmentSchema.default("STANDARD"),
  size: customerSizeSchema.default("SMALL"),
  type: customerTypeSchema.default("CUSTOMER"),
  creditStatus: creditCheckStatusSchema.default("PENDING"),
  defaultPriceListId: createIdSchema("Price List ID non valido").optional().nullable(),
  customerTaxRuleId: createIdSchema("Tax Rule ID non valido").optional().nullable(),
  paymentMethodId: createIdSchema("Payment Method ID non valido").optional().nullable(),

  // ── Supplier fields ───────────────────────────────────────────
  parentSupplierId: createIdSchema("Parent Supplier ID non valido").optional().nullable(),
  paymentTerms: z.string().max(255).optional().nullable(),
  bankAccount: z.string().max(255).optional().nullable(),
  leadTimeDays: z.number().int().min(0).default(0),
  transportCost: z.number().optional().nullable(),
  rating: supplierRatingSchema.default(5),
  supplierTaxRuleId: createIdSchema("Supplier Tax Rule ID non valido").optional().nullable(),

  // ── Shared commercial ─────────────────────────────────────────
  creditLimit: z
    .number("Inserire un valore numerico")
    .min(0, "Il fido non può essere negativo")
    .optional()
    .nullable(),
});
