// packages/shared/src/validators/user.ts
import { z } from "zod";
import {
  createIdSchema,
  dateStringSchema,
  emailSchema,
  phoneSchema,
  urlSchema,
} from "./primitives";
import { countryCodeBaseSchema, userIdSchema } from "./base";
import { roleIdSchema } from "./role";
import { paginationSchema, queryBooleanOrAllSchema } from "./query";

// ============================================================================
// ENUMS
// sort → base → create → update → id param → query → special
// ============================================================================

/**
 * Gender values matching the Prisma `Gender` enum in user.prisma.
 */
export const genderSchema = z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]);

/**
 * Lifecycle states for a user's membership in a tenant.
 * Matches the Prisma `MembershipStatus` enum.
 */
export const membershipStatusSchema = z.enum(["INVITED", "ACTIVE", "SUSPENDED"]);

/**
 * Allowed sort fields for user list queries.
 */
export const userSortFieldSchema = z.enum([
  "createdAt",
  "updatedAt",
  "username",
  "email",
  "lastLogin",
]);

// ============================================================================
// PRIMITIVES
// ============================================================================

/**
 * Validated username: 3-50 chars, alphanumeric + underscore only.
 * Matches the `username VARCHAR(50) UNIQUE` column on the `users` table.
 */
export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username deve essere almeno 3 caratteri")
  .max(50, "Username troppo lungo")
  .regex(/^[a-zA-Z0-9_]+$/, "Username può contenere solo lettere, numeri e underscore");

/**
 * Validated password: min 8 chars, must include uppercase, lowercase, digit.
 * Matches the `password VARCHAR(255)` column on the `users` table.
 */
export const passwordSchema = z
  .string()
  .min(8, "Password deve essere almeno 8 caratteri")
  .max(255, "Password troppo lunga")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password deve contenere maiuscola, minuscola e numero",
  );

// ============================================================================
// BASE SCHEMA — User core fields (no relations, no timestamps)
// ============================================================================

/**
 * Core user fields shared between create and update operations.
 * Does NOT include password (handled separately for security).
 */
export const userBaseSchema = z.object({
  username: usernameSchema,
  email: emailSchema(),
  active: z.boolean().default(true),
  preferredLanguageId: createIdSchema("Language ID non valido").optional().nullable(),
});

// ============================================================================
// USER DETAILS — Vertical partition (UserDetails model)
// ============================================================================

/**
 * Full shape of the `user_details` table.
 * All optional/nullable fields mirror Prisma nullability.
 */
export const userDetailsSchema = z.object({
  firstName: z.string().trim().min(1, "Nome obbligatorio").max(100, "Nome troppo lungo"),
  lastName: z.string().trim().min(1, "Cognome obbligatorio").max(100, "Cognome troppo lungo"),
  profilePicture: urlSchema(),
  phone: phoneSchema.optional().nullable(),
  address: z.string().max(255, "Indirizzo troppo lungo").optional().nullable(),
  city: z.string().max(100, "Città troppo lunga").optional().nullable(),
  state: z.string().max(100, "Provincia troppo lunga").optional().nullable(),
  zipCode: z.string().max(20, "CAP troppo lungo").optional().nullable(),
  countryCode: countryCodeBaseSchema.optional().nullable(),
  dateOfBirth: dateStringSchema({
    max: new Date(),
    min: (() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 120);
      return d;
    })(),
    message: {
      max: "La data di nascita non può essere futura",
      min: "La data di nascita non è valida (massimo 120 anni fa)",
    },
  }),
  gender: genderSchema.default("PREFER_NOT_TO_SAY"),
  bio: z.string().max(1000, "Biografia troppo lunga").optional().nullable(),
});

// ============================================================================
// PUBLIC RESPONSE SCHEMA — safe shape returned by mapUserResponse()
// ============================================================================

/**
 * Shape of the user object returned by the API (password excluded).
 * Mirrors what `mapUserResponse()` in user-helper.ts produces.
 */
export const userSchema = userBaseSchema.extend({
  id: userIdSchema,
  lastLogin: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable().optional(),
  details: userDetailsSchema.optional().nullable(),
});

// ============================================================================
// CREATE SCHEMAS
// ============================================================================

/**
 * Admin-only user creation.
 * Requires credentials + mandatory name fields + at least one role.
 * Used by: POST /api/users  →  CreateUserInput
 */
export const createUserSchema = userBaseSchema
  .extend({
    password: passwordSchema,
    details: userDetailsSchema.partial().required({ firstName: true, lastName: true }),
    roleIds: z.array(roleIdSchema).min(1, "Deve essere assegnato almeno un ruolo"),
    preferredLanguageId: createIdSchema("Language ID non valido").optional().nullable(),
  })
  .strict();

/**
 * Public self-registration.
 * Requires username, email, password + basic name.
 * `confirmPassword` is validated client-side only (not forwarded to the API).
 * Used by: POST /api/users/register  →  RegisterUserInput
 */
export const registerUserSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema(),
    password: passwordSchema,
    confirmPassword: z.string(),
    details: userDetailsSchema.pick({
      firstName: true,
      lastName: true,
    }),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

// ============================================================================
// UPDATE SCHEMAS
// ============================================================================

/**
 * Partial update of the UserDetails record.
 * firstName and lastName remain required when the details object is present.
 * Used by: PUT /api/users/me/details  →  UpdateUserDetailsInput
 */
export const updateUserDetailsSchema = userDetailsSchema
  .partial()
  .required({ firstName: true, lastName: true })
  .strict();

export const profileFormSchema = updateUserDetailsSchema
  .omit({ dateOfBirth: true }) // rimuove il campo con output Date
  .extend({
    username: usernameSchema,
    preferredLanguageId: z.number().int().positive().optional().nullable(),
    // dateOfBirth rimane stringa nel form — la trasformazione avviene lato action
    dateOfBirth: z
      .string()
      .optional()
      .nullable()
      .refine((val) => !val || !isNaN(new Date(val).getTime()), { message: "Data non valida" })
      .refine((val) => !val || new Date(val) <= new Date(), {
        message: "La data di nascita non può essere futura",
      })
      .refine(
        (val) => {
          if (!val) return true;
          const min = new Date();
          min.setFullYear(min.getFullYear() - 120);
          return new Date(val) >= min;
        },
        { message: "La data di nascita non è valida (massimo 120 anni fa)" },
      ),
  });

/**
 * Partial update of core User fields + optional details block.
 * All fields are optional; omit a key to leave it unchanged.
 * Used by: PUT /api/users/me/profile  →  UpdateUserProfileInput
 */
export const updateUserProfileSchema = z
  .object({
    username: usernameSchema.optional(),
    email: emailSchema().optional(),
    preferredLanguageId: createIdSchema("Language ID non valido").optional().nullable(),
    details: updateUserDetailsSchema.optional().nullable(),
  })
  .strict();

/**
 * Toggle active flag for a user account (admin only).
 * Used by: PATCH /api/users/:id/toggle-active  →  ToggleUserStatusInput
 */
export const toggleUserStatusSchema = z
  .object({
    active: z.boolean(),
  })
  .strict();

// ============================================================================
// ID PARAM SCHEMAS
// ============================================================================

/**
 * Path param `id` for user routes.
 * Used by: GET/PUT/DELETE /api/users/:id  →  UserIdParam
 */
export const userIdParamSchema = z.object({
  id: userIdSchema,
});

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Query string filters for the user list endpoint.
 * Used by: GET /api/users  →  UserQueryInput
 */
export const userQuerySchema = paginationSchema
  .extend({
    search: z.string().optional(),
    active: queryBooleanOrAllSchema(),
    roleId: z.coerce.number().int().positive().optional(),
    sortBy: userSortFieldSchema.default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

/**
 * Authenticated password change (current user knows their password).
 * Invalidates all sessions on success — confirmPassword is UI-only.
 * Used by: PUT /api/users/me/change-password  →  ChangePasswordInput
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password attuale obbligatoria"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

// ============================================================================
// TWO-FACTOR AUTHENTICATION SCHEMAS
// ============================================================================

/**
 * Enable 2FA — requires password confirmation before issuing a TOTP seed.
 */
export const enableTwoFactorSchema = z
  .object({
    password: z.string().min(1, "Password obbligatoria per verifica"),
  })
  .strict();

/**
 * Confirm 2FA activation by submitting the first valid TOTP code.
 */
export const confirmTwoFactorSchema = z
  .object({
    code: z.string().length(6, "Codice deve essere 6 cifre"),
  })
  .strict();

/**
 * Disable 2FA — requires both password and a valid TOTP code.
 */
export const disableTwoFactorSchema = z
  .object({
    password: z.string().min(1, "Password obbligatoria per verifica"),
    code: z.string().length(6, "Codice 2FA obbligatorio"),
  })
  .strict();

/**
 * Regenerate 2FA backup codes — requires password confirmation.
 */
export const regenerateBackupCodesSchema = z
  .object({
    password: z.string().min(1, "Password obbligatoria per verifica"),
  })
  .strict();

// ============================================================================
// GDPR / SECURITY SCHEMAS
// ============================================================================

/**
 * Record explicit GDPR consent.
 */
export const updateConsentSchema = z
  .object({
    consentGiven: z.boolean(),
  })
  .strict();

/**
 * Request a personal data export (right to data portability).
 */
export const requestDataExportSchema = z
  .object({
    includeRelatedData: z.boolean().default(true),
    format: z.enum(["json", "csv"]).default("json"),
  })
  .strict();

/**
 * Request account deletion (right to be forgotten).
 */
export const requestAccountDeletionSchema = z
  .object({
    password: z.string().min(1, "Password obbligatoria per conferma"),
    reason: z.string().max(500).optional().nullable(),
  })
  .strict();

// ============================================================================
// FRONTEND FORM SCHEMAS
// ============================================================================

/**
 * Unified form schema for create/edit user forms in the admin panel.
 * password is optional on edit (leave blank = keep existing).
 */
export const userFormSchema = z.object({
  username: usernameSchema,
  email: emailSchema(),
  password: passwordSchema.optional().or(z.literal("")),
  roleIds: z.array(roleIdSchema).min(1, "Deve essere assegnato almeno un ruolo").optional(),
  preferredLanguageId: createIdSchema("Language ID non valido").optional().nullable(),
  ...userDetailsSchema.shape,
});

export const createUserFormSchema = userFormSchema.required({
  username: true,
  email: true,
});

export const updateUserFormSchema = userFormSchema.partial().extend({
  username: usernameSchema,
  email: emailSchema(),
  firstName: z.string().trim().min(1, "Nome obbligatorio").max(100, "Nome troppo lungo"),
  lastName: z.string().trim().min(1, "Cognome obbligatorio").max(100, "Cognome troppo lungo"),
});
