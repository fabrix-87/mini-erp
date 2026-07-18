import { z } from "zod";

import { countryCodeBaseSchema, inputJsonValueSchema, userIdSchema } from "./base";
import { createCuidSchema, createIdSchema } from "./primitives/id";
import {
  eoriNumberSchema,
  fiscalCodeSchema,
  internationalVatIdSchema,
  sdiCodeSchema,
  vatNumberSchema,
} from "./business/italian-codes";
import { emailSchema, phoneSchema, urlSchema } from "./primitives/string";
import { limitSchema, pageSchema, sortOrderSchema } from "./query/pagination";
import { createNestedAddressSchema } from "./address";

// ============================================================================
// ENUMS - Shared across all company types
// ============================================================================

/** Possible lifecycle statuses for a company record. */
export const companyStatusSchema = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "ARCHIVED"]);

/** Legal entity classification: juridical person, natural person, or foreign entity. */
export const companyTypeEntitySchema = z.enum(["JURIDICAL", "NATURAL", "FOREIGN"]);

export const companySortFieldSchema = z.enum([
  "id",
  "code",
  "name",
  "country",
  "status",
  "createdAt",
]);

/**
 * Base CUID schema for a Company ID.
 * @internal Used to build companyIdSchema and companyIdAsCompanyIdSchema.
 */
const companyIdBaseSchema = createCuidSchema("Company ID non valido");

/**
 * Schema that wraps a company identifier under the key `companyId`.
 * Used in nested contexts (e.g. note relations, sub-resources).
 */
export const companyIdAsCompanyIdSchema = z.object({
  companyId: companyIdBaseSchema,
});

/**
 * Schema that wraps a company identifier under the standard `id` key.
 * Used for route params (e.g. GET /companies/:id).
 */
export const companyIdSchema = z.object({
  id: companyIdBaseSchema,
});

// ============================================================================
// BASE COMPANY SCHEMA (reusable)
// ============================================================================

/**
 * Raw object shape — no refinements.
 * Used as a shared base for both create and update schemas.
 * Cross-field refinements are applied separately only where needed (strict create).
 */
const baseCompanyShape = z.object({
  /** Official registered name of the company. Required, max 255 chars. */
  companyName: z
    .string()
    .min(1, "Il nome dell'azienda è obbligatorio")
    .max(255, "Il nome non può superare 255 caratteri")
    .trim(),

  /** Commercial/trade name, if different from the legal name. */
  tradeName: z.string().max(255, "Trade name non può superare 255 caratteri").optional().nullable(),

  /** Legal form of the entity (e.g. S.r.l., S.p.A., GmbH). */
  legalForm: z.string().max(100, "Legal form non può superare 100 caratteri").optional().nullable(),

  /** Lifecycle status. Defaults to ACTIVE on creation. */
  status: companyStatusSchema.default("ACTIVE"),

  /** Entity type classification. Defaults to JURIDICAL on creation. */
  entityType: companyTypeEntitySchema.default("JURIDICAL"),

  // ===== Italian fiscal data =====

  /** Italian VAT number (Partita IVA). Optional on base schema. */
  vatNumber: vatNumberSchema(),

  /** Italian fiscal code (Codice Fiscale). Optional on base schema. */
  taxCode: fiscalCodeSchema(),

  /** Italian SDI (Sistema di Interscambio) recipient code for e-invoicing. */
  sdiCode: sdiCodeSchema(),

  /** Certified email address (PEC) for Italian e-invoicing compliance. */
  pec: emailSchema().optional().nullable(),

  // ===== Foreign/EU fiscal data =====

  /** International/EU VAT identifier for non-Italian companies. */
  vatId: internationalVatIdSchema(),

  /** EORI number for customs/import-export identification. */
  eoriNumber: eoriNumberSchema(),

  // ===== Country =====

  /** ISO 3166-1 alpha-2 country code. Defaults to "IT". */
  countryCode: countryCodeBaseSchema.default("IT"),

  // ===== General contacts =====

  /** Primary contact email address. */
  mainEmail: emailSchema().optional().nullable(),

  /** Primary contact phone number. */
  mainPhone: phoneSchema.optional().nullable(),

  /** Company website URL. */
  mainWebsite: urlSchema(false, 255),

  // ===== Relations =====

  /** ID of the internal user assigned to manage this company. */
  assignedUserId: userIdSchema.optional().nullable(),

  // ===== Custom fields =====

  /** Arbitrary JSON payload for tenant-specific extensions. */
  customFields: inputJsonValueSchema.optional().nullable(),

  /** Nested legal address, accepted inline at creation time. */
  legalAddress: createNestedAddressSchema,
});

// ============================================================================
// EU country codes — extracted as constant to avoid duplication
// ============================================================================

/**
 * ISO 3166-1 alpha-2 codes of EU member states (excluding Italy, which is
 * handled separately). "EL" removed — Greece's official ISO code is "GR".
 * @see https://ec.europa.eu/eurostat/statistics-explained/index.php/Glossary:Country_codes
 */
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
 * Base company schema without mandatory fiscal validations.
 * Intended for quick creation flows (e.g. quotes, prospects) where
 * fiscal data can be completed later.
 */
export const baseCompanySchema = baseCompanyShape.strict();

/**
 * Strict base object used as foundation for cross-field refinements.
 * Applying .strict() here (on the ZodObject) before .refine() is required
 * because ZodEffect (the result of .refine()) does not support .strict().
 * @internal
 */
const strictCompanyBase = baseCompanyShape.strict();

/**
 * Full company schema with mandatory fiscal validations.
 * Use when the context requires complete fiscal data
 * (e.g. invoice emission, confirmed orders).
 *
 * Rules enforced:
 * - IT + JURIDICAL → vatNumber required
 * - IT + NATURAL   → taxCode required
 * - EU             → vatId required
 * - Extra-EU       → vatId OR eoriNumber required
 * - IT + sdiCode "0000000" → pec required
 */
export const strictCompanySchema = strictCompanyBase
  .refine(
    (data) => {
      if (data.countryCode === "IT") {
        return data.entityType === "JURIDICAL" ? !!data.vatNumber : !!data.taxCode;
      }
      if (EU_COUNTRY_CODES.includes(data.countryCode as (typeof EU_COUNTRY_CODES)[number])) {
        return !!data.vatId;
      }
      // Extra-EU: at least one cross-border identifier must be present
      return !!(data.vatId || data.eoriNumber);
    },
    {
      message: "Dati fiscali obbligatori mancanti",
      path: ["vatNumber"],
    },
  )
  .refine(
    (data) => {
      // SDI fallback code "0000000" means the invoice is sent via PEC
      if (data.countryCode === "IT" && data.sdiCode === "0000000") {
        return !!data.pec;
      }
      return true;
    },
    {
      message: "PEC obbligatoria per SDI 0000000",
      path: ["pec"],
    },
  );

/**
 * Schema for partial company updates.
 * All fields are optional; cross-field fiscal refinements are intentionally
 * omitted because a partial payload may not carry all fields required to
 * evaluate fiscal consistency.
 */
export const updateCompanySchema = baseCompanyShape.partial().strict();

/**
 * Schema for company list/search filters.
 * All filters are optional and can be combined freely.
 */
export const companyFiltersSchema = z.object({
  search: z.string().optional(),
  status: companyStatusSchema.optional(),
  entityType: companyTypeEntitySchema.optional(),
  countryCode: countryCodeBaseSchema.optional(),
  assignedUserId: userIdSchema.optional().nullable(),
});

/**
 * Schema for company list query parameters.
 * Extends filters with pagination and sorting controls.
 */
export const companyQueryBaseSchema = companyFiltersSchema.extend({
  page: pageSchema,
  limit: limitSchema,
  /** Field name to sort by. Defaults to "id". */
  sortBy: z.string().optional().default("id"),
  sortOrder: sortOrderSchema,
});

/**
 * Schema for creating a note associated with a company.
 * Both companyId and content are required.
 */
export const createCompanyNoteSchema = z.object({
  companyId: createIdSchema("Company ID necessario"),
  /** Short descriptive title for the note. Max 255 chars. */
  title: z.string().max(255),
  /** Full text body of the note. */
  content: z.string(),
});

/**
 * Schema for updating an existing company note.
 * Omits companyId since the target note is identified via route param.
 */
export const updateCompanyNoteSchema = createCompanyNoteSchema.omit({ companyId: true });
