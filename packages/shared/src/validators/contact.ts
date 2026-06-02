import { z } from "zod";
import { createIdSchema } from "./primitives/id";
import { emailSchema, phoneSchema } from "./primitives/string";
import { queryBooleanOrAllSchema, queryEnumOrAllSchema } from "./query/params";
import { limitSchema, pageSchema, querySortOrderSchema } from "./query/pagination";

// ============================================================================
// SORT
// ============================================================================

/**
 * Sortable fields for Contact entity.
 * Direct fields live on Contact; relational fields (position, department) live on CompanyContact.
 */
export const contactSortFieldSchema = z.enum([
  "firstName",
  "lastName",
  "email",
  "createdAt",
  "updatedAt",
]);

/**
 * Sortable fields for CompanyContact (join table context).
 */
export const companyContactSortFieldSchema = z.enum([
  "position",
  "department",
  "isPrimaryContact",
  "createdAt",
]);

// ============================================================================
// COMPANY CONTACT (join table fields)
// ============================================================================

/**
 * Contextual fields shared between create and update of a CompanyContact relation.
 * Used both standalone and nested inside contact schemas.
 */
export const companyContactFieldsSchema = z.object({
  position: z.string().max(100, "Posizione non può superare 100 caratteri").optional().nullable(),

  department: z
    .string()
    .max(100, "Dipartimento non può superare 100 caratteri")
    .optional()
    .nullable(),

  isPrimaryContact: z.boolean().default(false),
});

/**
 * Schema for creating a CompanyContact link (associating an existing contact to a company).
 */
export const createCompanyContactSchema = companyContactFieldsSchema
  .extend({
    contactId: createIdSchema("Contact ID deve essere positivo"),
    companyId: createIdSchema("Company ID deve essere positivo"),
  })
  .strict();

/**
 * Schema for updating a CompanyContact link (contextual fields only).
 */
export const updateCompanyContactSchema = companyContactFieldsSchema.partial().strict();

// ============================================================================
// CONTACT
// ============================================================================

/**
 * Schema for creating a Contact.
 * companyId and CompanyContact contextual fields are included here
 * because a contact is always created in the context of a company.
 */
export const createContactSchema = z
  .object({
    // Company context — required on creation
    companyId: createIdSchema("Company ID deve essere positivo"),

    // Pure contact data
    firstName: z
      .string()
      .min(1, "Nome è obbligatorio")
      .max(100, "Nome non può superare 100 caratteri")
      .trim(),

    lastName: z.string().max(100, "Cognome non può superare 100 caratteri").optional().nullable(),

    email: emailSchema().optional().nullable(),

    phone: phoneSchema,

    mobilePhone: phoneSchema,

    active: z.boolean().default(true),

    notes: z.string().max(2000, "Note non possono superare 2000 caratteri").optional().nullable(),

    // CompanyContact contextual fields (flattened for API ergonomics)
    ...companyContactFieldsSchema.shape,
  })
  .strict();

/**
 * Schema for updating a Contact.
 * companyId is excluded — the company association cannot change via this endpoint.
 */
export const updateContactSchema = createContactSchema.omit({ companyId: true }).partial().strict();

// ============================================================================
// PARAMS & QUERY
// ============================================================================

/**
 * Schema for Contact ID param.
 */
export const contactIdSchema = z.object({
  id: createIdSchema("ID contatto non valido"),
});

/**
 * Schema for Contact query parameters.
 */
export const contactQuerySchema = z.object({
  companyId: createIdSchema("Company ID non valido").optional(),
  active: queryBooleanOrAllSchema(),
  isPrimaryContact: queryBooleanOrAllSchema(),
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
  position: z.string().trim().optional(),
  page: pageSchema,
  limit: limitSchema,
  sortBy: queryEnumOrAllSchema(contactSortFieldSchema.options),
  sortOrder: querySortOrderSchema(),
});

/**
 * Schema for toggling Contact active status.
 */
export const toggleContactActiveSchema = z
  .object({
    active: z.boolean(),
  })
  .strict();

/**
 * Schema for checking email uniqueness.
 * companyId removed: email is now globally unique on Contact.
 */
export const checkEmailSchema = z.object({
  email: emailSchema("Campo email necessario"),
});
