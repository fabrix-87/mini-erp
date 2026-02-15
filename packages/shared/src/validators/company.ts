import { z } from "zod";

import {
  countryCodeBaseSchema,
  inputJsonValueSchema,
  userIdSchema,
} from "./base";
import { createIdSchema } from "./primitives/id";
import {
  eoriNumberSchema,
  fiscalCodeSchema,
  internationalVatIdSchema,
  sdiCodeSchema,
  vatNumberSchema,
} from "./business/italian-codes";
import { emailSchema, phoneSchema } from "./primitives/string";
import { limitSchema, pageSchema, sortOrderSchema } from "./query/pagination";

// ============================================================================
// ENUMS - Shared across all company types
// ============================================================================

export const companyStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "ARCHIVED",
]);
export const companyTypeEntitySchema = z.enum([
  "JURIDICAL",
  "NATURAL",
  "FOREIGN",
]);

/**
 * Schema base ID Company
 */
const companyIdBaseSchema = createIdSchema("Company ID non valido");

/**
 * Schema per ID Company come companyId
 */
export const companyIdAsCompanyIdSchema = z.object({
  companyId: companyIdBaseSchema,
});

/**
 * Schema per ID Company
 */
export const companyIdSchema = z.object({
  id: companyIdBaseSchema,
});

// ============================================================================
// BASE COMPANY SCHEMA (riutilizzabile)
// ============================================================================

/**
 * Schema base per Company - usato per nested creation in Customer/Supplier
 */
export const baseCompanySchema = z
  .object({
    code: z
      .string()
      .min(1, "Il codice è obbligatorio")
      .max(20, "Il codice non può superare 20 caratteri")
      .trim()
      .optional(), // Generato automaticamente se non fornito

    companyName: z
      .string()
      .min(1, "Il nome dell'azienda è obbligatorio")
      .max(255, "Il nome non può superare 255 caratteri")
      .trim(),

    tradeName: z
      .string()
      .max(255, "Trade name non può superare 255 caratteri")
      .optional()
      .nullable(),

    legalForm: z
      .string()
      .max(100, "Legal form non può superare 100 caratteri")
      .optional()
      .nullable(),

    status: companyStatusSchema.default("ACTIVE"),
    entityType: companyTypeEntitySchema.default("JURIDICAL"),

    legalAddressId: createIdSchema("LegalAddressId non valido")
      .optional()
      .nullable(),

    // ===== Dati Fiscali ITALIANI =====
    vatNumber: vatNumberSchema(),
    taxCode: fiscalCodeSchema(),
    sdiCode: sdiCodeSchema(),
    pec: emailSchema().optional().nullable(),

    // ===== Dati Fiscali ESTERI =====
    vatId: internationalVatIdSchema(),
    eoriNumber: eoriNumberSchema(),

    taxRegime: z.string().max(20).optional().nullable(),
    vatExempt: z.boolean().default(false),
    vatExemptReason: z.string().max(100).optional().nullable(),

    // ===== Nazione =====
    countryCode: countryCodeBaseSchema.default("IT"),

    // ===== Contatti Generali =====
    mainEmail: emailSchema().optional().nullable(),

    mainPhone: phoneSchema.optional().nullable(),

    // ===== Relazioni =====
    assignedUserId: userIdSchema.optional().nullable(),

    // ===== Campi Custom =====
    customFields: inputJsonValueSchema.optional().nullable(),
    openingHours: inputJsonValueSchema.optional().nullable(),
  })
  .refine(
    (data) => {
      // Italian company validation
      if (data.countryCode === "IT") {
        if (data.entityType === "JURIDICAL") {
          return !!data.vatNumber;
        } else {
          return !!data.taxCode;
        }
      }

      // EU company validation
      const euCountries = [
        "AT",
        "BE",
        "BG",
        "HR",
        "CY",
        "CZ",
        "DE",
        "DK",
        "EE",
        "EL",
        "GR",
        "ES",
        "FI",
        "FR",
        "HU",
        "IE",
        "LT",
        "LU",
        "LV",
        "MT",
        "NL",
        "PL",
        "PT",
        "RO",
        "SE",
        "SI",
        "SK",
      ];

      if (euCountries.includes(data.countryCode)) {
        return !!data.vatId;
      }

      // Extra-EU: VAT ID or EORI
      return !!(data.vatId || data.eoriNumber);
    },
    {
      message: "Dati fiscali obbligatori mancanti",
      path: ["vatNumber"],
    },
  )
  .refine(
    (data) => {
      if (data.countryCode === "IT" && data.sdiCode === "0000000") {
        return !!data.pec;
      }
      return true;
    },
    {
      message: "PEC obbligatoria per SDI 0000000",
      path: ["pec"],
    },
  )
  .strict();

/**
 * Schema per Update Company (partial del base)
 */
export const updateCompanySchema = baseCompanySchema.partial().strict();

/**
 * Schema per Query Parameters Company
 */
export const companyQueryBaseSchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  status: companyStatusSchema.optional(),
  entityType: companyTypeEntitySchema.optional(),
  countryCode: countryCodeBaseSchema.optional(),
  assignedUserId: userIdSchema.optional().nullable(),
  sortBy: z.string().optional().default("id"),
  sortOrder: sortOrderSchema,
});

/**
 * Schema per Creazione note
 */
export const createCompanyNoteSchema = z.object({
  companyId: createIdSchema("Company ID necessario"),
  title: z.string().max(255),
  content: z.string(),
});

/**
 * Schema per Aggiornamento note
 */
export const updateCompanyNoteSchema =
  createCompanyNoteSchema.omit("companyId");
