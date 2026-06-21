import { 
  createUserSchema,
  registerUserSchema,
  updateUserProfileSchema,
  updateUserDetailsSchema,
  changePasswordSchema,
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