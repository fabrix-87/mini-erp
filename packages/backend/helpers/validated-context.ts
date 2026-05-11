import { AppBindings } from "@/lib/hono-app";
import { Context } from "hono";

/**
 * Validates the request body against provided types.
 * @param c
 * @returns
 */
export const getValidatedBody = <T>(c: Context<AppBindings>): T => c.get("validatedBody") as T;

/**
 * Validates the request query against provided types.
 * @param c
 * @returns
 */
export const getValidatedQuery = <T>(c: Context<AppBindings>): T => c.get("validatedQuery") as T;

/**
 * Validates the request params against provided types.
 * @param c
 * @returns
 */
export const getValidatedParams = <T>(c: Context<AppBindings>): T => c.get("validatedParams") as T;
