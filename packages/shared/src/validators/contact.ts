import {z} from "zod";
import { createIdSchema } from "./primitives/id";
import { emailSchema } from "./primitives/string";
import { queryBooleanSchema } from "./query/params";
import { limitSchema, pageSchema, sortOrderSchema } from "./query/pagination";

/**
 * Campi ordinabili per Contact
 */
export const contactSortFieldSchema = z.enum([
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
export const createContactSchema = z
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
export const updateContactSchema = createContactSchema.partial().strict();

/**
 * Schema per ID Contact
 */
export const contactIdSchema = z.object({
  id: createIdSchema("ID contatto non valido"),
});

/**
 * Schema per Query Parameters Contact
 */
export const contactQuerySchema = z.object({
  companyId: createIdSchema("Company ID non valido").optional(),
  active: queryBooleanSchema,
  isPrimaryContact: queryBooleanSchema,
  search: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  page: pageSchema,
  limit: limitSchema,
  sortBy: contactSortFieldSchema.optional(),
  sortOrder: sortOrderSchema,
});

/**
 * Schema per toggle active status
 */
export const toggleContactActiveSchema = z
  .object({
    active: z.boolean(),
  })
  .strict();

/**
 * Schema per check mail
 */
export const checkEmailSchema = z.object({
  email: emailSchema("Campo email necessario"),
  companyId: createIdSchema("ID company non valido"),
});
