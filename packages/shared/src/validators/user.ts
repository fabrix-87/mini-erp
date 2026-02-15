// packages/shared/src/validators/user.ts
import { z } from "zod";
import { createIdSchema, dateStringSchema, emailSchema, phoneSchema } from "./primitives";
import { userIdSchema } from "./base";
import { roleIdSchema, userRoleSchema } from "./role";
import { limitSchema, pageSchema, queryBooleanSchema, sortOrderSchema } from "./query";

// ============================================================================
// ENUMS
// ============================================================================

export const genderSchema = z.enum([
  "MALE",
  "FEMALE",
  "OTHER",
  "PREFER_NOT_TO_SAY",
]);

// ============================================================================
// BASE SCHEMAS
// ============================================================================

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username deve essere almeno 3 caratteri")
  .max(50, "Username troppo lungo")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username può contenere solo lettere, numeri e underscore"
  );

export const passwordSchema = z
  .string()
  .min(8, "Password deve essere almeno 8 caratteri")
  .max(255, "Password troppo lunga")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password deve contenere maiuscola, minuscola e numero"
  );

/**
 * Schema base per User (senza details)
 */
export const userBaseSchema = z.object({
  username: usernameSchema,
  email: emailSchema(),
  password: passwordSchema,
  active: z.boolean().default(true),
  preferredLanguageId: createIdSchema('Language ID obbligatorio'),
});

// ============================================================================
// USER DETAILS SCHEMA
// ============================================================================

export const userDetailsSchema = z.object({
  firstName: z.string().max(100, "Nome troppo lungo").optional(),
  lastName: z.string().max(100, "Cognome troppo lungo").optional(),
  profilePicture: z.url("URL non valido").optional().nullable(),
  phone: phoneSchema,

  // Address
  address: z.string().max(255, "Indirizzo troppo lungo").optional().nullable(),
  city: z.string().max(100, "Città troppo lungo").optional().nullable(),
  state: z.string().max(100, "Provincia troppo lungo").optional().nullable(),
  zipCode: z.string().max(20, "CAP troppo lungo").optional().nullable(),
  // TODO: Modificare il campo country con CountryCode ed associarlo alla tabella Country
  country: z.string().max(100, "Paese troppo lungo").optional().nullable(),

  // Personal
  dateOfBirth: dateStringSchema({
    max: new Date(),
    min: (() => {
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 120);
      return minDate;
    })(),
    message: {
      max: "La data di nascita non può essere futura",
      min: "La data di nascita non è valida (massimo 120 anni)",
    },
  }),
  gender: genderSchema.default("PREFER_NOT_TO_SAY"),
  bio: z.string().max(1000, "Biografia troppo lunga").optional().nullable(),
  lastLogin: dateStringSchema({max: new Date()}).default(new Date())
});

// ============================================================================
// Schema User completo
// ============================================================================

// Estendi lo schema con i campi aggiuntivi
export const userSchema = userBaseSchema.extend({
  id: userIdSchema,
  roles: z.array(userRoleSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  details: userDetailsSchema.optional(),
}).omit({ password: true }); // Rimuovi password dal type pubblico

// ============================================================================
// FORM SCHEMAS (Frontend)
// ============================================================================

export const userFormSchema = z.object({
  username: usernameSchema,
  email: emailSchema(),
  password: passwordSchema.optional().or(z.literal("")),
  roleIds: z.array(z.number()).optional(),
  ...userDetailsSchema.shape,
});

export const createUserFormSchema = userFormSchema.required({
  username: true,
  email: true,
  password: true,
});

export const updateUserFormSchema = userFormSchema.partial().extend({
  username: usernameSchema,
  email: emailSchema(),
});

// ============================================================================
// API SCHEMAS (Backend)
// ============================================================================

/**
 * Schema per validare ID utente nei params
 */
export const userIdParamSchema = z.object({
  id: userIdSchema,
});

/**
 * Schema alternativo per userId nei params
 */
export const userIdAsUserIdParamSchema = z.object({
  userId: userIdSchema,
});

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

/**
 * Schema per il login
 */
export const loginSchema = z.object({
  email: emailSchema(),
  password: z.string().min(1, "Password obbligatoria"),
});

/**
 * Schema per la richiesta di reset password
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema(),
});

/**
 * Schema per il reset password
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token obbligatorio"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

// ============================================================================
// CREATION SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un nuovo utente
 */
export const createUserSchema = userBaseSchema.extend({
  details: userDetailsSchema,
  roleIds: z
    .array(roleIdSchema)
    .min(1, "Deve essere assegnato almeno un ruolo")
    .optional(),
});

/**
 * Schema semplificato per registrazione pubblica
 */
export const registerUserSchema = userBaseSchema.pick({
  username: true,
  email: true,
  password: true,
})
  .extend({
    confirmPassword: z.string(),
    details: userDetailsSchema.pick({
      firstName: true,
      lastName: true,
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

// ============================================================================
// UPDATE SCHEMAS
// ============================================================================

/**
 * Schema per l'aggiornamento completo del profilo utente
 */
export const updateUserProfileSchema = z.object({
  username: userBaseSchema.shape.username.optional(),
  email: userBaseSchema.shape.email.optional(),
  active: z.boolean().optional(),
  preferredLanguageId: z.number().int().positive().optional().nullable(),
  details: userDetailsSchema.partial().optional(),
});

/**
 * Schema per l'aggiornamento solo dei dettagli personali
 */
export const updateUserDetailsSchema = userDetailsSchema.partial();

/**
 * Schema per il cambio password
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password attuale obbligatoria"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(
    (data: { newPassword: string; confirmPassword: string }) =>
      data.newPassword === data.confirmPassword,
    {
      message: "Le password non corrispondono",
      path: ["confirmPassword"],
    }
  );

/**
 * Schema per l'aggiornamento dei ruoli (solo Admin)
 */
export const updateUserRolesSchema = z.object({
  roleIds: z
    .array(roleIdSchema)
    .min(1, "Deve essere assegnato almeno un ruolo"),
});

/**
 * Schema per attivare/disattivare un utente
 */
export const yoggleUserStatusSchema = z.object({
  active: z.boolean(),
});

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Schema per query di ricerca/filtro utenti
 */
export const userQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  active: queryBooleanSchema,
  roleId: createIdSchema('RoleId non valido').optional(),
  sortBy: z.enum(["createdAt", "username", "email"]).default("createdAt"),
  sortOrder: sortOrderSchema,
});
