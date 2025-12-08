import { z } from "zod";
import { validateQuery } from "../middleware/validation";

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
      .length(7, "Codice SDI deve essere esattamente 7 caratteri")
      .optional()
      .nullable()
      .refine((val) => !val || sdiCodeRegex.test(val), {
        message: "Codice SDI non valido (7 caratteri alfanumerici)",
      }),

    pec: z
      .email("Indirizzo PEC non valido")
      .max(255, "PEC non può superare 255 caratteri")
      .optional()
      .nullable(),

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
    mainEmail: z
      .email("Email non valida")
      .max(255, "Email non può superare 255 caratteri")
      .optional()
      .nullable(),

    mainPhone: z
      .string()
      .max(50, "Telefono non può superare 50 caratteri")
      .optional()
      .nullable(),

    // ===== Relazioni =====
    assignedUserId: z
      .number()
      .int("User ID deve essere un intero")
      .positive("User ID deve essere positivo")
      .optional()
      .nullable(),

    // ===== Campi Custom =====
    customFields: z.any().optional().nullable(),
    openingHours: z.any().optional().nullable(),
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
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "1")),

  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "10")),

  search: z.string().optional(),

  status: CompanyStatusSchema.optional(),
  entityType: CompanyTypeEntitySchema.optional(),

  countryCode: z
    .string()
    .length(2, "Country code deve essere 2 caratteri")
    .optional(),

  assignedUserId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),

  sortBy: z.string().optional().default("id"),

  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

/**
 * Schema per ID Company
 */
export const CompanyIdSchema = z.object({
  id: z.string().transform((val) => {
    const num = parseInt(val);
    if (isNaN(num) || num <= 0) {
      throw new Error("ID company non valido");
    }
    return num;
  }),
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

export const validateCompanyQuery = validateQuery(
  CompanyQueryBaseSchema,
  "Company search"
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type BaseCompanyInput = z.infer<typeof BaseCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;
export type CompanyStatus = z.infer<typeof CompanyStatusSchema>;
export type CompanyTypeEntity = z.infer<typeof CompanyTypeEntitySchema>;
