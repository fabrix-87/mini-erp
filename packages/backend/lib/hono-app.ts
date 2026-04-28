// lib/hono-app.ts
import { AppContextVariables } from "@/types/app-types";
import { Hono } from "hono";

// ============================================================================
// App Bindings
// ============================================================================

/**
 * Hono environment bindings shared across the entire application.
 * Add Bindings (e.g. Cloudflare env) here if needed in the future.
 */
export type AppBindings = {
  Variables: AppContextVariables;
};

// ============================================================================
// Typed App Factory
// ============================================================================

/**
 * Creates a typed Hono application instance with shared context variables.
 * Use this factory for every route file and the main app to ensure
 * consistent typing across all middleware and handlers.
 *
 * @example
 * const authRoutes = createHonoApp();
 * authRoutes.get("/me", (c) => {
 *   const user = c.get("user"); // typed: AuthContextUser | null
 * });
 */
export const createHonoApp = (): Hono<AppBindings> => {
  return new Hono<AppBindings>();
};

/**
 * Convenience type alias for Hono with app bindings.
 * Use when you need to type a reference to an app instance.
 *
 * @example
 * const app: HonoApp = createHonoApp();
 */
export type HonoApp = Hono<AppBindings>;
