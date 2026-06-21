import { validateBody, validateParams } from "@/middleware/validation-middleware";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, verifyEmailSchema } from "@mini-erp/shared";

/**
 * Middleware per il login
 */
export const validateLogin = validateBody(loginSchema, "User login");

/**
 * Middleware per la richiesta di reset password
 */
export const validateForgotPassword = validateBody(forgotPasswordSchema, "Forgot password");

/**
 * Middleware per il reset password
 */
export const validateResetPassword = validateBody(resetPasswordSchema, "Reset password");

/**
 * Middleware per la validazione della mail
 */
export const validateVerifyEmail = validateParams(verifyEmailSchema, "Verify email");
