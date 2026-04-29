// lib/hono-app.ts
import { AppContextVariables } from "@/types/app-types";
import { Hono } from "hono";

// ============================================================================
// App Bindings
// ============================================================================

/**
 * Application-level Hono environment type.
 * Bindings: empty for Bun backend (no Cloudflare Workers env needed).
 * Variables: typed context variables set/get via c.set() / c.get().
 */
export interface AppBindings {
  Bindings: Record<string, never>;
  Variables: AppContextVariables;
}

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
