// middleware/async-handler-middleware.ts
import type { Context, Next } from "hono";
import type { AppBindings } from "../lib/hono-app";

type HonoHandler = (c: Context<AppBindings>, next: Next) => Promise<Response | void>;

/**
 * Wraps an async Hono handler to ensure unhandled promise rejections
 * are forwarded to the global error handler via onError().
 *
 * NOTE: Hono handles async errors natively in route handlers.
 * This wrapper is provided for explicit clarity or edge cases where
 * manual async wrapping is preferred.
 *
 * @param fn - Async Hono handler function
 *
 * @example
 * app.get("/resource", asyncHandler(async (c) => {
 *   const data = await someService.fetch();
 *   return c.json(data);
 * }));
 */
const asyncHandler = (fn: HonoHandler): HonoHandler => {
  return (c: Context<AppBindings>, next: Next) => {
    return Promise.resolve(fn(c, next)).catch((err) => {
      throw err; // Forwarded to app.onError()
    });
  };
};

export default asyncHandler;
