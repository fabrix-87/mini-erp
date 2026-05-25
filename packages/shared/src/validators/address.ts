import { z } from "zod";
import { createIdSchema } from "./primitives/id";
import { countryCodeBaseSchema, inputJsonValueSchema } from "./base";
import { phoneSchema } from "./primitives/string";
import { queryBooleanSchema } from "./query/params";

// ============================================================================
// ADDRESS ENUMS
// ============================================================================

export const addressTypeSchema = z.enum([
  "LEGAL",
  "BILLING",
  "SHIPPING",
  "OFFICE",
  "WAREHOUSE",
  "OTHER",
]);

// ============================================================================
// ADDRESS SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un Address
 */
export const createAddressSchema = z
  .object({
    companyId: createIdSchema("Company ID non valido"),
    addressType: addressTypeSchema.default("LEGAL"),
    address: z
      .string()
      .min(1, "Indirizzo è obbligatorio")
      .max(255, "Indirizzo non può superare 255 caratteri")
      .trim(),
    city: z
      .string()
      .min(1, "Città è obbligatoria")
      .max(100, "Città non può superare 100 caratteri")
      .trim(),
    provinceCode: z
      .string()
      .length(2, "Codice provincia deve essere 2 caratteri (es. MI, RM)")
      .optional()
      .nullable(),
    zipCode: z
      .string()
      .min(1, "CAP è obbligatorio")
      .max(20, "CAP non può superare 20 caratteri")
      .trim(),
    countryCode: countryCodeBaseSchema,
    latitude: z
      .number()
      .min(-90, "Latitudine deve essere tra -90 e 90")
      .max(90, "Latitudine deve essere tra -90 e 90")
      .optional()
      .nullable(),
    longitude: z
      .number()
      .min(-180, "Longitudine deve essere tra -180 e 180")
      .max(180, "Longitudine deve essere tra -180 e 180")
      .optional()
      .nullable(),
    phone: phoneSchema,
    isPrimary: z.boolean().default(false),
    openingHours: inputJsonValueSchema.optional().nullable(),
    notes: z
      .string()
      .max(500, "Note non possono superare 500 caratteri")
      .optional()
      .nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un Address
 */
export const updateAddressSchema = createAddressSchema.omit({ companyId: true })
  .partial()
  .strict();

/**
 * Schema per ID Address
 */
export const addressIdSchema = z.object({
  id: createIdSchema("ID indirizzo non valido"),
});

/**
 * Schema per Query Parameters Address
 */
export const addressQuerySchema = z.object({
  companyId: createIdSchema("Company ID non valido"),
  addressType: addressTypeSchema.optional(),
  countryCode: countryCodeBaseSchema,
  isPrimary: queryBooleanSchema,
  provinceCode: z.string().length(2).optional(),
  city: z.string().optional(),
});

/**
 * Schema per impostare Primary Address
 */
export const setPrimaryAddressSchema = z
  .object({
    isPrimary: z.boolean(),
  })
  .strict();


/**
 * Schema for nested address creation (inside company create/update).
 * companyId is omitted because it is injected automatically by Prisma.
 */
export const createNestedAddressSchema = createAddressSchema.omit({ companyId: true }).required('addressType');