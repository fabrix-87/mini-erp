import { getCurrentTenant } from "@/controllers/tenant-controller";
import { createHonoApp } from "@/lib/hono-app";
import { authorize } from "@/middleware/auth-middleware";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const tenantRoutes = createHonoApp()

tenantRoutes.get(
    "/current",
    requireTenantScope,
    authorize(["tenant:read", "tenant:manage"]),
    getCurrentTenant,
)


export default tenantRoutes;