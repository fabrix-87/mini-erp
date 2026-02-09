// ============================================================================
// ADDRESS ENUMS
// ============================================================================

import z from "zod";

import { createIdSchema, InputJsonValueSchema, PhoneSchema } from "../utils";
import { CountryCodeBaseSchema } from "./base";

export const AddressTypeSchema = z.enum([
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
export const CreateAddressSchema = z
  .object({
    companyId: createIdSchema("Company ID non valido"),
    addressType: AddressTypeSchema.default("LEGAL"),
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
    countryCode: CountryCodeBaseSchema,
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
    phone: PhoneSchema,
    isPrimary: z.boolean().default(false),
    openingHours: InputJsonValueSchema.optional().nullable(),
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
export const UpdateAddressSchema = CreateAddressSchema.omit({ companyId: true })
  .partial()
  .strict();

/**
 * Schema per ID Address
 */
export const AddressIdSchema = z.object({
  id: createIdSchema("ID indirizzo non valido"),
});

/**
 * Schema per Query Parameters Address
 */
export const AddressQuerySchema = z.object({
  companyId: createIdSchema("Company ID non valido"),  
  addressType: AddressTypeSchema.optional(),  
  countryCode: CountryCodeBaseSchema,  
  isPrimary: z.enum(['true', 'false'])
    .optional()
    .transform(val => val === 'true' ? true : val === 'false' ? false : undefined),  
  provinceCode: z.string()
    .length(2)
    .optional(),  
  city: z.string().optional(),
});

/**
 * Schema per impostare Primary Address
 */
export const SetPrimaryAddressSchema = z.object({
  isPrimary: z.boolean(),
}).strict();