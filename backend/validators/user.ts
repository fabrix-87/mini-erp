// validators/user.ts

import { z } from "zod";
import {
  validate,
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";

// ============================================================================
// ENUMS
// ============================================================================

export const GenderSchema = z.enum([
  "MALE",
  "FEMALE",
  "OTHER",
  "PREFER_NOT_TO_SAY",
]);

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Schema base per User (senza details)
 */
const UserBaseSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Il nome utente deve contenere almeno 3 caratteri")
    .max(50, "Il nome utente non può superare 50 caratteri")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Il nome utente può contenere solo lettere, numeri, underscore e trattini"
    ),

  email: z
    .email("Formato email non valido")
    .max(255, "L'email non può superare 255 caratteri")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, "La password deve contenere almeno 8 caratteri")
    .max(255, "La password non può superare 255 caratteri")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La password deve contenere almeno una lettera maiuscola, una minuscola e un numero"
    ),

  active: z.boolean().default(true),

  preferredLanguageId: z.number().int().positive().optional().nullable(),
});

/**
 * Schema base per UserDetails
 */
const UserDetailsBaseSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Il nome è obbligatorio")
    .max(100, "Il nome non può superare 100 caratteri"),

  lastName: z
    .string()
    .trim()
    .min(1, "Il cognome è obbligatorio")
    .max(100, "Il cognome non può superare 100 caratteri"),

  profilePicture: z
    .string()
    .url("URL immagine non valido")
    .max(500, "L'URL non può superare 500 caratteri")
    .optional()
    .nullable(),

  phone: z
    .string()
    .max(20, "Il telefono non può superare 20 caratteri")
    .regex(/^[+]?[\d\s()-]*$/, "Formato telefono non valido")
    .optional()
    .nullable(),

  address: z
    .string()
    .max(255, "L'indirizzo non può superare 255 caratteri")
    .optional()
    .nullable(),

  city: z
    .string()
    .max(100, "La città non può superare 100 caratteri")
    .optional()
    .nullable(),

  state: z
    .string()
    .max(100, "La provincia/stato non può superare 100 caratteri")
    .optional()
    .nullable(),

  zipCode: z
    .string()
    .max(20, "Il CAP non può superare 20 caratteri")
    .optional()
    .nullable(),

  country: z
    .string()
    .length(2, "Il codice paese deve essere di 2 lettere (ISO code)")
    .toUpperCase()
    .default("IT"),

  dateOfBirth: z.coerce
    .date()
    .max(new Date(), "La data di nascita non può essere futura")
    .refine(
      (date) => {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 120);
        return date >= minDate;
      },
      { message: "La data di nascita non è valida" }
    )
    .optional()
    .nullable(),

  gender: GenderSchema.default("PREFER_NOT_TO_SAY"),

  bio: z
    .string()
    .max(1000, "La biografia non può superare 1000 caratteri")
    .optional()
    .nullable(),

  active: z.boolean().default(true),
});

/**
 * Schema per validare ID utente nei params
 */
const UserIdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive("ID utente non valido")),
});

/**
 * Schema alternativo per userId nei params
 */
const UserIdAsUserIdParamSchema = z.object({
  userId: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive("ID utente non valido")),
});

// ============================================================================
// CREATION SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un nuovo utente
 */
export const CreateUserSchema = UserBaseSchema.extend({
  details: UserDetailsBaseSchema,
  roleIds: z
    .array(z.number().int().positive())
    .min(1, "Deve essere assegnato almeno un ruolo")
    .optional(),
});

/**
 * Schema semplificato per registrazione pubblica
 */
export const RegisterUserSchema = UserBaseSchema.pick({
  username: true,
  email: true,
  password: true,
})
  .extend({
    confirmPassword: z.string(),
    details: UserDetailsBaseSchema.pick({
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
export const UpdateUserProfileSchema = z.object({
  username: UserBaseSchema.shape.username.optional(),
  email: UserBaseSchema.shape.email.optional(),
  active: z.boolean().optional(),
  preferredLanguageId: z.number().int().positive().optional().nullable(),
  details: UserDetailsBaseSchema.partial().optional(),
});

/**
 * Schema per l'aggiornamento solo dei dettagli personali
 */
export const UpdateUserDetailsSchema = UserDetailsBaseSchema.partial();

/**
 * Schema per il cambio password
 */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password attuale obbligatoria"),
    newPassword: z
      .string()
      .min(8, "La nuova password deve contenere almeno 8 caratteri")
      .max(255, "La password non può superare 255 caratteri")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "La password deve contenere almeno una lettera maiuscola, una minuscola e un numero"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "La nuova password deve essere diversa da quella attuale",
    path: ["newPassword"],
  });

/**
 * Schema per l'aggiornamento dei ruoli (solo Admin)
 */
export const UpdateUserRolesSchema = z.object({
  roleIds: z
    .array(z.number().int().positive())
    .min(1, "Deve essere assegnato almeno un ruolo"),
});

/**
 * Schema per attivare/disattivare un utente
 */
export const ToggleUserStatusSchema = z.object({
  params: UserIdParamSchema,
  body: z.object({
    active: z.boolean(),
  }),
});

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

/**
 * Schema per il login
 */
export const LoginSchema = z.object({
  email: z.email("Formato email non valido").toLowerCase().trim(),
  password: z.string().min(1, "Password obbligatoria"),
});

/**
 * Schema per il refresh token
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token obbligatorio"),
});

/**
 * Schema per la richiesta di reset password
 */
export const ForgotPasswordSchema = z.object({
  email: z.email("Formato email non valido").toLowerCase().trim(),
});

/**
 * Schema per il reset password
 */
export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token obbligatorio"),
    newPassword: z
      .string()
      .min(8, "La password deve contenere almeno 8 caratteri")
      .max(255, "La password non può superare 255 caratteri")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "La password deve contenere almeno una lettera maiuscola, una minuscola e un numero"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Schema per query di ricerca/filtro utenti
 */
export const UserQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .default(1),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100))
    .default(10),
  search: z.string().optional(),
  active: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  roleId: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .optional(),
  sortBy: z.enum(["createdAt", "username", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Middleware per la creazione di un utente (Admin)
 */
export const validateCreateUser = validateBody(
  CreateUserSchema,
  "User creation"
);

/**
 * Middleware per la registrazione pubblica
 */
export const validateRegisterUser = validateBody(
  RegisterUserSchema,
  "User registration"
);

/**
 * Middleware per il login
 */
export const validateLogin = validateBody(LoginSchema, "User login");

/**
 * Middleware per il refresh token
 */
export const validateRefreshToken = validateBody(
  RefreshTokenSchema,
  "Token refresh"
);

/**
 * Middleware per la richiesta di reset password
 */
export const validateForgotPassword = validateBody(
  ForgotPasswordSchema,
  "Forgot password"
);

/**
 * Middleware per il reset password
 */
export const validateResetPassword = validateBody(
  ResetPasswordSchema,
  "Reset password"
);

/**
 * Middleware per l'aggiornamento del profilo
 */
export const validateUpdateUserProfile = validateBody(
  UpdateUserProfileSchema,
  "User profile update"
);

/**
 * Middleware per l'aggiornamento dei dettagli
 */
export const validateUpdateUserDetails = validateBody(
  UpdateUserDetailsSchema,
  "User details update"
);

/**
 * Middleware per il cambio password
 */
export const validateChangePassword = validateBody(
  ChangePasswordSchema,
  "Password change"
);

/**
 * Middleware per l'aggiornamento dei ruoli
 */
export const validateUpdateUserRoles = validateBody(
  UpdateUserRolesSchema,
  "User roles update"
);

/**
 * Middleware per attivare/disattivare utente
 */
export const validateToggleUserStatus = validate(
  ToggleUserStatusSchema,
  "Toggle user status"
);

/**
 * Middleware per la validazione dell'ID utente (params)
 */
export const validateUserId = validateParams(
  UserIdParamSchema,
  "User ID validation"
);

/**
 * Middleware per query di ricerca utenti
 */
export const validateUserQuery = validateQuery(UserQuerySchema, "User query");

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Gender = z.infer<typeof GenderSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
export type UpdateUserDetailsInput = z.infer<typeof UpdateUserDetailsSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type UpdateUserRolesInput = z.infer<typeof UpdateUserRolesSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type UserQueryInput = z.infer<typeof UserQuerySchema>;
