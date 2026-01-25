import z from "zod";
import {
  createIdSchema,
  emailSchema,
  QueryBooleanSchema,
  sortOrderSchema,
} from "../utils";

/**
 * Campi ordinabili per Contact
 */
export const ContactSortFieldSchema = z.enum([
  "firstName",
  "lastName",
  "email",
  "position",
  "department",
  "createdAt",
  "updatedAt",
]);

/**
 * Schema per la creazione di un Contact
 */
export const CreateContactSchema = z
  .object({
    companyId: createIdSchema("Company ID deve essere positivo"),

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

    email: emailSchema(),

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
  id: createIdSchema("ID contatto non valido"),
});

/**
 * Schema per Query Parameters Contact
 */
export const ContactQuerySchema = z.object({
  companyId: createIdSchema("Company ID non valido").optional(),

  active: QueryBooleanSchema,
  isPrimaryContact: QueryBooleanSchema,

  search: z.string().optional(),

  department: z.string().optional(),

  position: z.string().optional(),

  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: ContactSortFieldSchema.optional(),
  sortOrder: sortOrderSchema,
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
  email: emailSchema("Campo email necessario"),
  companyId: createIdSchema("ID company non valido"),
});
