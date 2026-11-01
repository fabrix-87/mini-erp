import type { Context } from "hono";
import type { AppBindings } from "@/lib/hono-app";
import type { DocumentCreateContext } from "@/types";
import { BadRequestError, UnauthorizedError } from "@/utils/app-error-utils";

/**
 * Extracts the tenant and user context required by document services.
 * @throws UnauthorizedError when unauthenticated; BadRequestError when no tenant is selected
 * (this also covers SUPER_ADMIN users, who bypass requireTenantScope).
 */
export function requireDocumentContext(c: Context<AppBindings>): DocumentCreateContext {
  const user = c.get("user");
  if (!user) throw new UnauthorizedError("Authentication required");
  const tenantId = user.currentTenant?.tenantId;
  if (!tenantId) throw new BadRequestError("Tenant context is required for this operation");
  return { tenantId, userId: user.userId };
}
