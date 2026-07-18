import { prisma } from "@/config/prisma-config";
import { getRequiredTenantId } from "@/helpers/validated-context";
import { AppBindings } from "@/lib/hono-app";
import { sendNotFound, sendSuccess } from "@/utils/response-utils";
import { Context } from "hono";

export const getCurrentTenant = async (c: Context<AppBindings>) => {
  const tenantId = getRequiredTenantId(c);

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      company: true,
      _count: { 
        select: {
            memberships: true,
            customers: true,
            suppliers: true,
            contacts: true,
            products: true,
            leads: true,
        }
      }
    },
  });

  if (!tenant) {
    return sendNotFound(c, "Tenant not found");
  }

  return sendSuccess(c, tenant);
};
