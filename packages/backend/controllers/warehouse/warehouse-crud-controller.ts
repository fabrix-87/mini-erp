import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { withTenantId, withTenantScope } from "@/helpers/prisma-helper";
import { getRequiredTenantId, getValidatedQuery } from "@/helpers/validated-context";
import { AppBindings } from "@/lib/hono-app";
import { sendPaginatedResponse } from "@/utils/response-utils";
import { WarehouseQueryInput } from "@mini-erp/shared";
import { Context } from "hono";

// ============================================================================
// WAREHOUSE CONTROLLERS
// ============================================================================

/**
 * @desc   Get all warehouses with filters and pagination
 * @route  GET /api/warehouses
 * @access Private (warehouse:read)
 */
export const getAllWarehouses = async (c: Context<AppBindings>) => {
  const {
    page = 1,
    limit = 10,
    search,
    type,
    sortBy = "name",
    sortOrder = "asc",
  } = getValidatedQuery<WarehouseQueryInput>(c);

  const tenantId = getRequiredTenantId(c);

  const skip = (page - 1) * limit;
  const where: Prisma.WarehouseWhereInput = withTenantId({active: true}, tenantId);

  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  if (type) where.type = type;

  const [warehouses, total] = await Promise.all([
    prisma.warehouse.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.warehouse.count({ where }),
  ]);

  return sendPaginatedResponse(c, warehouses, total, page, limit);
};
