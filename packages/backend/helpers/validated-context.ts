import { AppBindings } from "@/lib/hono-app";
import { BadRequestError } from "@/utils/app-error-utils";
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

/**
 * Returns the current tenant ID from the request context.
 * Throws a BadRequestError (400) when the value is absent.
 *
 * Must only be called in handlers guarded by the `requireTenantScope`
 * middleware, which guarantees the value is populated before the
 * controller executes.
 *
 * @param c - Hono request context.
 * @returns The current tenant ID as a non-empty string.
 * @throws {BadRequestError} When `currentTenantId` is not set on the context.
 */
export const getRequiredTenantId = (c: Context<AppBindings>): string => {
  const tenantId = c.get("currentTenantId");
  if (!tenantId) {
    throw new BadRequestError("Tenant context is required for this operation");
  }
  return tenantId;
};

/**
 * Returns the authenticated user's preferred language ID from the request context.
 * Throws a BadRequestError (400) when the value is absent.
 *
 * @param c - Hono request context.
 * @returns The preferred language ID as a positive integer.
 * @throws {BadRequestError} When `preferredLanguageId` is not set on the authenticated user.
 */
export const getRequiredLanguageId = (c: Context<AppBindings>): number => {
  const { preferredLanguageId } = c.get("user")!;
  if (!preferredLanguageId) {
    throw new BadRequestError("Language not defined");
  }
  return preferredLanguageId;
};
