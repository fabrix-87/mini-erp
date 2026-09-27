import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { connectById, withTenantId, withTenantScope } from "@/helpers/prisma-helper";
import {
  getRequiredTenantId,
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import { AppBindings } from "@/lib/hono-app";
import { ConflictError } from "@/utils/app-error-utils";
import {
  sendCreated,
  sendDeleted,
  sendFail,
  sendNotFound,
  sendPaginatedResponse,
  sendSuccess,
} from "@/utils/response-utils";
import {
  CreateWarehouseInput,
  UpdateWarehouseInput,
  WarehouseIdParam,
  WarehouseQueryInput,
} from "@mini-erp/shared";
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
    active,
    sortBy = "name",
    sortOrder = "asc",
  } = getValidatedQuery<WarehouseQueryInput>(c);

  const tenantId = getRequiredTenantId(c);

  const skip = (page - 1) * limit;
  const where: Prisma.WarehouseWhereInput = withTenantId({}, tenantId);

  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  if (type) where.type = type;
  if (active !== undefined) where.active = active;

  const [rawWarehouses, total] = await Promise.all([
    prisma.warehouse.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        supplier: {
          select: {
            company: {
              select: {
                companyName: true,
              },
            },
          },
        },
        _count: {
          select: {
            stockMovements: true,
            virtualStocks: true,
            stockReservations: true,
            stockBatches: true,
            documents: true,
            documentLines: true,
          },
        },
      },
    }),
    prisma.warehouse.count({ where }),
  ]);

  const warehouses = rawWarehouses.map((warehouse) => {
    const hasDependencies = Object.values(warehouse._count).some((count) => count > 0);

    return {
      ...warehouse,
      hasDependencies,
    };
  });

  return sendPaginatedResponse(c, warehouses, total, page, limit);
};

/**
 * @desc   Create a new warehouse
 * @route  POST /api/warehouses
 * @access Private (warehouse:create)
 */
export const createWarehouse = async (c: Context<AppBindings>) => {
  const body = getValidatedBody<CreateWarehouseInput>(c);
  const tenantId = getRequiredTenantId(c);

  // check supplier
  if (body.supplierId) {
    const supplier = await prisma.supplier.findUnique({
      where: { tenantId, id: body.supplierId, deletedAt: null },
      select: { id: true },
    });

    if (!supplier || body.type !== "VIRTUAL")
      return sendFail(c, { message: "Invalid supplier or invalid type" });
  }

  // check code
  const alreadyExist = await prisma.warehouse.findUnique({
    where: { tenantId, code: body.code },
    select: { id: true },
  });
  if (alreadyExist) {
    return sendFail(c, { message: "Warehouse code already present" });
  }

  const warehouse = await prisma.$transaction(async (tx) => {
    const currentDefault = await tx.warehouse.findUnique({
      where: { tenantId, isDefault: true },
      select: { id: true },
    });

    if (body.isDefault && currentDefault) {
      await tx.warehouse.update({
        where: { tenantId, id: currentDefault.id },
        data: { isDefault: false },
      });
    }

    return tx.warehouse.create({
      data: {
        ...body,
        tenantId: tenantId,
        isDefault: currentDefault ? body.isDefault : true,
      },
    });
  });

  return sendCreated(c, warehouse, "warehouse created");
};

/**
 * @desc   Update a warehouse
 * @route  PATCH /api/warehouses
 * @access Private (warehouse:update)
 */
export const updateWarehouse = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<WarehouseIdParam>(c);
  const body = getValidatedBody<UpdateWarehouseInput>(c);
  const tenantId = getRequiredTenantId(c);

  // check warehouse
  const existing = await prisma.warehouse.findUnique({
    where: { tenantId, id },
    select: { id: true },
  });
  if (!existing) {
    return sendNotFound(c, "Warehouse not found");
  }

  // check supplier
  if (body.supplierId) {
    const supplier = await prisma.supplier.findUnique({
      where: { tenantId, id: body.supplierId, deletedAt: null },
      select: { id: true },
    });

    if (!supplier || body.type !== "VIRTUAL")
      return sendFail(c, { message: "Invalid supplier or invalid type" });
  }

  // check code
  const codeAlreadyExist = await prisma.warehouse.findUnique({
    where: { tenantId, code: body.code, NOT: { id } },
    select: { id: true },
  });
  if (codeAlreadyExist) {
    return sendFail(c, { message: "Warehouse code already present" });
  }

  const warehouse = await prisma.$transaction(async (tx) => {
    const currentDefault = await tx.warehouse.findUnique({
      where: { tenantId, isDefault: true, NOT: { id } },
      select: { id: true },
    });

    if (body.isDefault && currentDefault) {
      await tx.warehouse.update({
        where: { tenantId, id: currentDefault.id },
        data: { isDefault: false },
      });
    }

    return tx.warehouse.update({
      where: { id, tenantId },
      data: {
        ...body,
        isDefault: currentDefault ? body.isDefault : true,
      },
    });
  });

  return sendSuccess(c, warehouse, { message: "warehouse updated" });
};

/**
 * @desc   Toggle active status of a warehouse
 * @route  PATCH /api/warehouses/[:id]/toggle-active
 * @access Private (warehouse:update)
 */
export const toggleActiveWarehouse = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<WarehouseIdParam>(c);
  const tenantId = getRequiredTenantId(c);

  const warehouse = await prisma.warehouse.findUnique({
    where: { tenantId, id },
    select: { active: true, isDefault: true },
  });

  if (!warehouse) {
    return sendNotFound(c, "warehouse not found");
  }

  if (warehouse.isDefault) {
    throw new ConflictError("Impossibile disattivare il magazzino di default.");
  }

  const result = await prisma.warehouse.update({
    where: { id },
    data: { active: !warehouse.active },
  });

  return sendSuccess(c, result, { message: "Status modificato" });
};

/**
 * @desc   Deletes a warehouse only if it has no associated movements.
 * @route  DELETE /api/warehouses
 * @access Private (warehouse:delete)
 */
export const deleteWarehouse = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<WarehouseIdParam>(c);
  const tenantId = getRequiredTenantId(c);

  const warehouse = await prisma.warehouse.findUnique({
    where: { tenantId, id },
    select: {
      isDefault: true,
      _count: {
        select: {
          stockMovements: true,
          virtualStocks: true,
          stockReservations: true,
          stockBatches: true,
          documents: true,
          documentLines: true,
        },
      },
    },
  });

  if (!warehouse) {
    return sendNotFound(c, "warehouse not found");
  }

  if (warehouse.isDefault) {
    throw new ConflictError("Impossibile eliminare il magazzino di default.");
  }

  const hasDependencies = Object.values(warehouse._count).some((count) => count > 0);

  if (hasDependencies) {
    throw new ConflictError(
      "Impossibile eliminare il magazzino: sono presenti documenti, giacenze o movimenti associati.",
    );
  }

  await prisma.warehouse.delete({
    where: { id, tenantId },
  });

  return sendDeleted(c, "deleted warehouse");
};
