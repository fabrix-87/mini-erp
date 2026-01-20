import z from "zod";
import {
  createIdSchema,
  emailSchema,
  InputJsonValueSchema,
  limitSchema,
  pageSchema,
  positiveNumbersSchema,
  sortOrderSchema,
} from "../utils";
import { UserIdSchema } from "./base";

// ============================================================================
// ENUMS - Shared across all company types
// ============================================================================

export const CompanyStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "ARCHIVED",
]);
export const CompanyTypeEntitySchema = z.enum([
  "JURIDICAL",
  "NATURAL",
  "FOREIGN",
]);

/**
 * Schema per ID Company come companyId
 */
export const CompanyIdAsCompanyIdSchema = z.object({
  companyId: createIdSchema("Company ID non valido"),
});

/**
 * Schema per ID Company
 */
export const CompanyIdSchema = z.object({
  id: createIdSchema("Company ID non valido"),
});

// ============================================================================
// VALIDATION REGEX
// ============================================================================

export const italianVATRegex = /^\d{11}$/;
export const italianTaxCodeRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
export const sdiCodeRegex = /^[A-Z0-9]{7}$/;

// ============================================================================
// BASE COMPANY SCHEMA (riutilizzabile)
// ============================================================================

/**
 * Schema base per Company - usato per nested creation in Customer/Supplier
 */
export const BaseCompanySchema = z
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

    status: CompanyStatusSchema.default("ACTIVE"),
    entityType: CompanyTypeEntitySchema.default("JURIDICAL"),

    legalAddressId: createIdSchema("LegalAddressId non valido")
      .optional()
      .nullable(),

    // ===== Dati Fiscali ITALIANI =====
    vatNumber: z
      .string()
      .max(20, "Partita IVA non può superare 20 caratteri")
      .optional()
      .nullable()
      .refine((val) => !val || italianVATRegex.test(val), {
        message: "Partita IVA non valida (deve essere 11 cifre numeriche)",
      }),

    taxCode: z
      .string()
      .max(20, "Codice Fiscale non può superare 20 caratteri")
      .optional()
      .nullable()
      .refine((val) => !val || italianTaxCodeRegex.test(val), {
        message: "Codice Fiscale non valido (formato: RSSMRA85M01H501Z)",
      }),

    sdiCode: z
      .string()
      .refine((val) => val === "" || val.length === 7, {
        message: "Codice SDI deve essere esattamente 7 caratteri",
      })
      .refine((val) => val === "" || sdiCodeRegex.test(val), {
        message: "Codice SDI non valido (7 caratteri alfanumerici)",
      })
      .transform((val) => (val === "" ? null : val))
      .nullable()
      .optional(),

    pec: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val.trim()))
      .refine((val) => val === null || z.email().safeParse(val).success, {
        message: "Indirizzo PEC non valido",
      })
      .refine((val) => val === null || val.length <= 255, {
        message: "PEC non può superare 255 caratteri",
      })
      .nullable()
      .optional(),

    // ===== Dati Fiscali ESTERI =====
    eoriNumber: z
      .string()
      .max(20, "EORI non può superare 20 caratteri")
      .optional()
      .nullable(),

    vatId: z
      .string()
      .max(20, "VAT ID non può superare 20 caratteri")
      .optional()
      .nullable(),

    // ===== Nazione =====
    countryCode: z
      .string()
      .length(2, "Country code deve essere esattamente 2 caratteri (ISO)")
      .default("IT"),

    // ===== Contatti Generali =====
    mainEmail: emailSchema().optional().nullable(),

    mainPhone: z
      .string()
      .max(50, "Telefono non può superare 50 caratteri")
      .optional()
      .nullable(),

    // ===== Relazioni =====
    assignedUserId: UserIdSchema.optional().nullable(),

    // ===== Campi Custom =====
    customFields: InputJsonValueSchema.optional().nullable(),
    openingHours: InputJsonValueSchema.optional().nullable(),
  })
  .strict();

/**
 * Schema per Update Company (partial del base)
 */
export const UpdateCompanySchema = BaseCompanySchema.partial().strict();

/**
 * Schema per Query Parameters Company
 */
export const CompanyQueryBaseSchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),

  status: CompanyStatusSchema.optional(),
  entityType: CompanyTypeEntitySchema.optional(),

  countryCode: z
    .string()
    .length(2, "Country code deve essere 2 caratteri")
    .optional(),

  assignedUserId: UserIdSchema.optional().nullable(),

  sortBy: z.string().optional().default("id"),

  sortOrder: sortOrderSchema,
});

/**
 * Schema per Creazione note
 */
export const CreateCompanyNoteSchema = z.object({
  companyId: createIdSchema("Company ID necessario"),
  title: z.string().max(255),
  content: z.string(),
});

/**
 * Schema per Aggiornamento note
 */
export const UpdateCompanyNoteSchema =
  CreateCompanyNoteSchema.omit("companyId");
