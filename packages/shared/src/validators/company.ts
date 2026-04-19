import { z } from "zod";

import { countryCodeBaseSchema, inputJsonValueSchema, userIdSchema } from "./base";
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
import { createAddressSchema } from "./address";

// ============================================================================
// ENUMS - Shared across all company types
// ============================================================================

export const companyStatusSchema = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "ARCHIVED"]);
export const companyTypeEntitySchema = z.enum(["JURIDICAL", "NATURAL", "FOREIGN"]);

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
 * Raw object shape — no refinements.
 * Used as base for both create and update schemas.
 * Refinements are applied separately only where needed (create).
 */
const baseCompanyShape = z.object({
  companyName: z
    .string()
    .min(1, "Il nome dell'azienda è obbligatorio")
    .max(255, "Il nome non può superare 255 caratteri")
    .trim(),

  tradeName: z.string().max(255, "Trade name non può superare 255 caratteri").optional().nullable(),

  legalForm: z.string().max(100, "Legal form non può superare 100 caratteri").optional().nullable(),

  status: companyStatusSchema.default("ACTIVE"),
  entityType: companyTypeEntitySchema.default("JURIDICAL"),

  // ===== Dati Fiscali ITALIANI =====
  vatNumber: vatNumberSchema(),
  taxCode: fiscalCodeSchema(),
  sdiCode: sdiCodeSchema(),
  pec: emailSchema().optional().nullable(),

  // ===== Dati Fiscali ESTERI =====
  vatId: internationalVatIdSchema(),
  eoriNumber: eoriNumberSchema(),

  taxRegime: z.string().max(20).optional().nullable(),

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

  // supporto per nested addresses al momento della creazione
  addresses: z.array(createAddressSchema.omit({ companyId: true })).optional(),
});

// ============================================================================
// EU country codes — extracted as constant to avoid duplication
// ============================================================================

const EU_COUNTRY_CODES = [
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
] as const;

/**
 * Schema base senza validazioni fiscali obbligatorie.
 * Usato per la creazione rapida (es. preventivi, prospect).
 * I dati fiscali possono essere completati in seguito.
 */
export const baseCompanySchema = baseCompanyShape.strict();

/**
 * Schema completo con validazioni fiscali obbligatorie.
 * Da usare quando il contesto richiede dati fiscali completi
 * (es. emissione fattura, ordine confermato).
 */
export const strictCompanySchema = baseCompanyShape
  .refine(
    (data) => {
      if (data.countryCode === "IT") {
        return data.entityType === "JURIDICAL" ? !!data.vatNumber : !!data.taxCode;
      }
      if (EU_COUNTRY_CODES.includes(data.countryCode as (typeof EU_COUNTRY_CODES)[number])) {
        return !!data.vatId;
      }
      // Extra-EU
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
 * Schema for Company update — partial of raw shape, no fiscal refinements.
 * Refinements are intentionally omitted: partial updates may not include
 * all fields required to validate fiscal consistency.
 */
export const updateCompanySchema = baseCompanyShape.partial().strict();

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
export const updateCompanyNoteSchema = createCompanyNoteSchema.omit("companyId");
