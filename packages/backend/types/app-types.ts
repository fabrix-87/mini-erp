import { AuthContextUser, AuthJwtPayload } from "./user-types";

// ============================================================================
// Hono Variables Types
// ============================================================================

/**
 * Shared Hono context variables used across auth middleware and routes.
 */
export interface AppContextVariables {
  user?: AuthContextUser;
  jwtPayload?: AuthJwtPayload;
  validatedBody?: unknown;
  validatedQuery?: unknown;
  validatedParams?: unknown;
}