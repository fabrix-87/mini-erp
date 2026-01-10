import { 
  CreateUserSchema,
  RegisterUserSchema,
  UpdateUserProfileSchema,
  UpdateUserDetailsSchema,
  ChangePasswordSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdateUserRolesSchema,
  ToggleUserStatusSchema,
  UserIdParamSchema,
  UserQuerySchema
} from '@mini-erp/shared/validators/user';


// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

import { validateBody, validateParams, validateQuery } from "../middleware/validation";

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
export const validateToggleUserStatus = validateBody(
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