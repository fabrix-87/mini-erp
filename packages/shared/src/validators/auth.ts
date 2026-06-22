import { z } from "zod";
import { emailSchema } from "./primitives";
import { passwordSchema } from "./user";

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

/**
 * Standard email + password login.
 * Used by: POST /api/users/login  →  LoginInput
 */
export const loginSchema = z
  .object({
    email: emailSchema(),
    password: z
      .string()
      .min(1, "Password obbligatoria")
      .min(6, "La password deve contenere almeno 6 caratteri"),
  })
  .strict();

/**
 * Request a password-reset link via email.
 * Used by: POST /api/users/forgot-password  →  ForgotPasswordInput
 */
export const forgotPasswordSchema = z
  .object({
    email: emailSchema(),
  })
  .strict();

/**
 * Consume a password-reset token and set the new password.
 * `confirmPassword` is validated client-side only (not forwarded to the API).
 * Used by: POST /api/users/reset-password  →  ResetPasswordInput
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token obbligatorio"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

/**
 * Email verification via token in path params.
 * The token is a 64-char hex string (SHA-256 of the raw token).
 * Used by: GET /api/users/verify-email/:token  →  VerifyEmailInput
 */
export const verifyEmailSchema = z.object({
  token: z.string().length(64, "Token di verifica non valido"),
});
