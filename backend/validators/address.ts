import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { validate, validateBody, validateParams, validateQuery } from '../middleware/validation';

// ============================================================================
// ADDRESS ENUMS
// ============================================================================

export const AddressTypeSchema = z.enum([
  'LEGAL',
  'BILLING',
  'SHIPPING',
  'OFFICE',
  'WAREHOUSE',
  'OTHER'
]);

// ============================================================================
// ADDRESS SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un Address
 */
export const CreateAddressSchema = z.object({
  companyId: z.number()
    .int('Company ID deve essere un intero')
    .positive('Company ID deve essere positivo'),
  
  addressType: AddressTypeSchema.default('LEGAL'),
  
  address: z.string()
    .min(1, 'Indirizzo è obbligatorio')
    .max(255, 'Indirizzo non può superare 255 caratteri')
    .trim(),
  
  city: z.string()
    .min(1, 'Città è obbligatoria')
    .max(100, 'Città non può superare 100 caratteri')
    .trim(),
  
  provinceCode: z.string()
    .length(2, 'Codice provincia deve essere 2 caratteri (es. MI, RM)')
    .optional()
    .nullable(),
  
  zipCode: z.string()
    .min(1, 'CAP è obbligatorio')
    .max(20, 'CAP non può superare 20 caratteri')
    .trim(),
  
  countryCode: z.string()
    .length(2, 'Country code deve essere 2 caratteri (ISO)')
    .default('IT'),
  
  latitude: z.number()
    .min(-90, 'Latitudine deve essere tra -90 e 90')
    .max(90, 'Latitudine deve essere tra -90 e 90')
    .optional()
    .nullable(),
  
  longitude: z.number()
    .min(-180, 'Longitudine deve essere tra -180 e 180')
    .max(180, 'Longitudine deve essere tra -180 e 180')
    .optional()
    .nullable(),
  
  phone: z.string()
    .max(50, 'Telefono non può superare 50 caratteri')
    .optional()
    .nullable(),
  
  isPrimary: z.boolean().default(false),
  
  openingHours: z.any().optional().nullable(),
  
  notes: z.string()
    .max(500, 'Note non possono superare 500 caratteri')
    .optional()
    .nullable(),
}).strict();

/**
 * Schema per l'aggiornamento di un Address
 */
export const UpdateAddressSchema = CreateAddressSchema
  .omit({ companyId: true })
  .partial()
  .strict();

/**
 * Schema per ID Address
 */
export const AddressIdSchema = z.object({
  id: z.string().transform(val => {
    const num = parseInt(val);
    if (isNaN(num) || num <= 0) {
      throw new Error('ID indirizzo non valido');
    }
    return num;
  }),
});

/**
 * Schema per Query Parameters Address
 */
export const AddressQuerySchema = z.object({
  companyId: z.string()
    .optional()
    .transform(val => val ? parseInt(val) : undefined),
  
  addressType: AddressTypeSchema.optional(),
  
  countryCode: z.string()
    .length(2)
    .optional(),
  
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

// ============================================================================
// VALIDATION MIDDLEWARE EXPORTS
// ============================================================================

export const validateCreateAddress = (req: Request, res: Response, next: NextFunction) => 
  validateBody(CreateAddressSchema, 'Address creation')(req, res, next);

export const validateUpdateAddress = (req: Request, res: Response, next: NextFunction) =>
  validate({ body: UpdateAddressSchema, params: AddressIdSchema }, 'Address update')(req, res, next);

export const validateAddressId = (req: Request, res: Response, next: NextFunction) =>
  validateParams(AddressIdSchema, 'Address ID')(req, res, next);

export const validateAddressQuery = (req: Request, res: Response, next: NextFunction) =>
  validateQuery(AddressQuerySchema, 'Address query')(req, res, next);

export const validateSetPrimaryAddress = (req: Request, res: Response, next: NextFunction) => {
  return validate({
    body: SetPrimaryAddressSchema,
    params: AddressIdSchema
  }, 'Set primary address')(req, res, next);
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;
export type AddressType = z.infer<typeof AddressTypeSchema>;