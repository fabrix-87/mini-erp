import { z } from "zod";
import {
  validate,
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
      .string()
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
export const UpdateContactSchema = CreateContactSchema.omit({ companyId: true })
  .partial()
  .strict();

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

  pagination: z
    .string()
    .optional()
    .transform((val) => (val ? JSON.parse(val) : undefined))
    .pipe(
      z
        .object({
          page: z.number(),
          limit: z.number(),
          sortBy: z.enum(["firstname", "lastname", "companyId", "email"]),
          sortOrder: z.enum(["asc", "desc"]),
        })
        .optional()
    ),
});

/**
 * Schema per toggle active status
 */
export const ToggleContactActiveSchema = z
  .object({
    active: z.boolean(),
  })
  .strict();

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCreateContact = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return validateBody(CreateContactSchema, "Contact creation")(req, res, next);
};

export const validateUpdateContact = (
  req: Request,
  res: Response,
  next: NextFunction
) =>
  validate(
    { body: UpdateContactSchema, params: ContactIdSchema },
    "Contact update"
  )(req, res, next);

export const validateContactId = (
  req: Request,
  res: Response,
  next: NextFunction
) => validateParams(ContactIdSchema, "Contact ID")(req, res, next);

export const validateContactQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => validateQuery(ContactQuerySchema, "Contact query")(req, res, next);

export const validateToggleContactActive = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return validate(
    {
      body: ToggleContactActiveSchema,
      params: ContactIdSchema,
    },
    "Toggle contact active"
  )(req, res, next);
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;
export type ToggleContactActiveInput = z.infer<
  typeof ToggleContactActiveSchema
>;
