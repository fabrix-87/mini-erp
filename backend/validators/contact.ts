import { z } from "zod";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import { NextFunction, Request, Response } from "express";

// ============================================================================
// CONTACT SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un Contact
 */
export const CreateContactSchema = z
  .object({
    companyId: z
      .number()
      .int("Company ID deve essere un intero")
      .positive("Company ID deve essere positivo"),

    firstName: z
      .string()
      .min(1, "Nome è obbligatorio")
      .max(100, "Nome non può superare 100 caratteri")
      .trim(),

    lastName: z
      .string()
      .min(1, "Cognome è obbligatorio")
      .max(100, "Cognome non può superare 100 caratteri")
      .trim(),

    email: z
      .email("Email non valida")
      .max(255, "Email non può superare 255 caratteri"),

    phone: z
      .string()
      .max(50, "Telefono non può superare 50 caratteri")
      .optional()
      .nullable(),

    mobilePhone: z
      .string()
      .max(50, "Cellulare non può superare 50 caratteri")
      .optional()
      .nullable(),

    position: z
      .string()
      .max(100, "Posizione non può superare 100 caratteri")
      .optional()
      .nullable(),

    department: z
      .string()
      .max(100, "Dipartimento non può superare 100 caratteri")
      .optional()
      .nullable(),

    isPrimaryContact: z.boolean().default(false),

    active: z.boolean().default(true),

    notes: z
      .string()
      .max(500, "Note non possono superare 500 caratteri")
      .optional()
      .nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un Contact
 */
export const UpdateContactSchema = CreateContactSchema.partial().strict();

/**
 * Schema per ID Contact
 */
export const ContactIdSchema = z.object({
  id: z.string().transform((val) => {
    const num = parseInt(val);
    if (isNaN(num) || num <= 0) {
      throw new Error("ID contatto non valido");
    }
    return num;
  }),
});

/**
 * Schema per ID Company
 */
const CompanyIdSchema = z.object({
  companyId: z.string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive('Company ID non valido')),
});

/**
 * Schema per Query Parameters Contact
 */
export const ContactQuerySchema = z.object({
  companyId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),

  active: z
    .enum(["true", "false"])
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined
    ),

  isPrimaryContact: z
    .enum(["true", "false"])
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined
    ),

  search: z.string().optional(),

  department: z.string().optional(),

  position: z.string().optional(),

  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["firstName", "lastName", "companyId", "email"]).optional(),
  sortOrder: z
    .string() // Inizia con uno schema di stringa
    .toLowerCase() // Trasforma la stringa in minuscolo
    .pipe(
      // Passa il risultato trasformato al prossimo schema
      z.enum(["asc", "desc"]) // Enum con valori in minuscolo
    )
    .default("asc"),
});

/**
 * Schema per toggle active status
 */
export const ToggleContactActiveSchema = z
  .object({
    active: z.boolean(),
  })
  .strict();

/**
 * Schema per check mail
 */
export const CheckEmailSchema = z.object({
  email: z.email(),
  companyId: z.string().transform((val) => {
    const num = parseInt(val);
    if (isNaN(num) || num <= 0) {
      throw new Error("ID company non valido");
    }
    return num;
  }),
});

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCreateContact = validateBody(
  CreateContactSchema,
  "Contact creation"
);

export const validateUpdateContact = validateBody(
  UpdateContactSchema,
  "Contact update"
);

export const validateContactId = validateParams(ContactIdSchema, "Contact ID");
export const validateCompanyId = validateParams(CompanyIdSchema, "Company ID");

export const validateContactQuery = validateQuery(
  ContactQuerySchema,
  "Contact query"
);

export const validateCheckEmail = validateQuery(
  CheckEmailSchema,
  "Contact check mail"
);

export const validateToggleContactActive = validateBody(
  ToggleContactActiveSchema,
  "Toggle contact active"
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;
export type ContactQueryInput = z.infer<typeof ContactQuerySchema>;
export type CheckMailInput = z.infer<typeof CheckEmailSchema>;
export type ToggleContactActiveInput = z.infer<
  typeof ToggleContactActiveSchema
>;
