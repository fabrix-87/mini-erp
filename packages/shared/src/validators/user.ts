// packages/shared/src/validators/user.ts
import { z } from "zod";
import { UserRoleSchema } from "./role";
import { UserIdSchema } from "./base";
import { dateStringSchema } from "../utils";

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

export const UsernameSchema = z
  .string()
  .trim()
  .min(3, "Username deve essere almeno 3 caratteri")
  .max(50, "Username troppo lungo")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username può contenere solo lettere, numeri e underscore"
  );

export const EmailSchema = z.email("Email non valida").toLowerCase().trim();

export const PasswordSchema = z
  .string()
  .min(8, "Password deve essere almeno 8 caratteri")
  .max(255, "Password troppo lunga")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password deve contenere maiuscola, minuscola e numero"
  );

export const PhoneSchema = z
  .string()
  .max(20, "Telefono troppo lungo")
  .regex(/^[+]?[\d\s()-]*$/, "Formato telefono non valido")
  .optional()
  .nullable();

/**
 * Schema base per User (senza details)
 */
export const UserBaseSchema = z.object({
  username: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema,
  active: z.boolean().default(true),
  preferredLanguageId: z.number().int().positive().optional().nullable(),
});

// ============================================================================
// USER DETAILS SCHEMA
// ============================================================================

export const UserDetailsSchema = z.object({
  firstName: z.string().max(100, "Nome troppo lungo").optional(),
  lastName: z.string().max(100, "Cognome troppo lungo").optional(),
  profilePicture: z.url("URL non valido").optional().nullable(),
  phone: PhoneSchema,

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
  gender: GenderSchema.default("PREFER_NOT_TO_SAY"),
  bio: z.string().max(1000, "Biografia troppo lunga").optional().nullable(),
  lastLogin: dateStringSchema({max: new Date()}).default(new Date())
});

// ============================================================================
// Schema User completo
// ============================================================================

// Estendi lo schema con i campi aggiuntivi
export const UserSchema = UserBaseSchema.extend({
  id: UserIdSchema,
  roles: z.array(UserRoleSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  details: UserDetailsSchema.optional(),
}).omit({ password: true }); // Rimuovi password dal type pubblico

// ============================================================================
// FORM SCHEMAS (Frontend)
// ============================================================================

export const UserFormSchema = z.object({
  username: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema.optional().or(z.literal("")),
  roleIds: z.array(z.number()).optional(),
  ...UserDetailsSchema.shape,
});

export const CreateUserFormSchema = UserFormSchema.required({
  username: true,
  email: true,
  password: true,
});

export const UpdateUserFormSchema = UserFormSchema.partial().extend({
  username: UsernameSchema,
  email: EmailSchema,
});

// ============================================================================
// API SCHEMAS (Backend)
// ============================================================================

/**
 * Schema per validare ID utente nei params
 */
export const UserIdParamSchema = z.object({
  id: UserIdSchema,
});

/**
 * Schema alternativo per userId nei params
 */
export const UserIdAsUserIdParamSchema = z.object({
  userId: UserIdSchema,
});

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

/**
 * Schema per il login
 */
export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Password obbligatoria"),
});

/**
 * Schema per la richiesta di reset password
 */
export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

/**
 * Schema per il reset password
 */
export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token obbligatorio"),
    newPassword: PasswordSchema,
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
export const CreateUserSchema = UserBaseSchema.extend({
  details: UserDetailsSchema,
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
    details: UserDetailsSchema.pick({
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
  details: UserDetailsSchema.partial().optional(),
});

/**
 * Schema per l'aggiornamento solo dei dettagli personali
 */
export const UpdateUserDetailsSchema = UserDetailsSchema.partial();

/**
 * Schema per il cambio password
 */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password attuale obbligatoria"),
    newPassword: PasswordSchema,
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
export const UpdateUserRolesSchema = z.object({
  roleIds: z
    .array(z.number().int().positive())
    .min(1, "Deve essere assegnato almeno un ruolo"),
});

/**
 * Schema per attivare/disattivare un utente
 */
export const ToggleUserStatusSchema = z.object({
  active: z.boolean(),
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
    .pipe(z.number().int().positive().max(1000))
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
