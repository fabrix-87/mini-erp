import { 
  createUserSchema,
  registerUserSchema,
  updateUserProfileSchema,
  updateUserDetailsSchema,
  changePasswordSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateUserRolesSchema,
  toggleUserStatusSchema,
  userIdParamSchema,
  userQuerySchema
} from '@mini-erp/shared/validators/user';


// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

import { validateBody, validateParams, validateQuery } from "../middleware/validation-middleware";

/**
 * Middleware per la creazione di un utente (Admin)
 */
export const validateCreateUser = validateBody(
  createUserSchema,
  "User creation"
);

/**
 * Middleware per la registrazione pubblica
 */
export const validateRegisterUser = validateBody(
  registerUserSchema,
  "User registration"
);

/**
 * Middleware per il login
 */
export const validateLogin = validateBody(loginSchema, "User login");

/**
 * Middleware per la richiesta di reset password
 */
export const validateForgotPassword = validateBody(
  forgotPasswordSchema,
  "Forgot password"
);

/**
 * Middleware per il reset password
 */
export const validateResetPassword = validateBody(
  resetPasswordSchema,
  "Reset password"
);

/**
 * Middleware per l'aggiornamento del profilo
 */
export const validateUpdateUserProfile = validateBody(
  updateUserProfileSchema,
  "User profile update"
);

/**
 * Middleware per l'aggiornamento dei dettagli
 */
export const validateUpdateUserDetails = validateBody(
  updateUserDetailsSchema,
  "User details update"
);

/**
 * Middleware per il cambio password
 */
export const validateChangePassword = validateBody(
  changePasswordSchema,
  "Password change"
);

/**
 * Middleware per l'aggiornamento dei ruoli
 */
export const validateUpdateUserRoles = validateBody(
  updateUserRolesSchema,
  "User roles update"
);

/**
 * Middleware per attivare/disattivare utente
 */
export const validateToggleUserStatus = validateBody(
  toggleUserStatusSchema,
  "Toggle user status"
);

/**
 * Middleware per la validazione dell'ID utente (params)
 */
export const validateUserId = validateParams(
  userIdParamSchema,
  "User ID validation"
);

/**
 * Middleware per query di ricerca utenti
 */
export const validateUserQuery = validateQuery(userQuerySchema, "User query");