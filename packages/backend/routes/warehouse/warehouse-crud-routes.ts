import {
  createWarehouse,
  deleteWarehouse,
  getAllWarehouses,
  toggleActiveWarehouse,
  updateWarehouse,
} from "@/controllers/warehouse-controller";
import { createHonoApp } from "@/lib/hono-app";
import { authorize } from "@/middleware/auth-middleware";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";
import {
  validateCreateWarehouseBody,
  validateUpdateWarehouseBody,
  validateWarehouseId,
  validateWarehouseQuery,
} from "@/validators/warehouse-validator";

const warehouseCrudRoutes = createHonoApp();

/**
 * @route   GET /api/warehouses/
 * @desc    Get all warehouses with filters and pagination
 * @access  Private (warehouse:read)
 * @query   page, limit, search?, type?, sortBy, sortOrder
 */
warehouseCrudRoutes.get(
  "/",
  requireTenantScope,
  authorize(["warehouse:read", "warehouse:manage"]),
  validateWarehouseQuery,
  getAllWarehouses,
);

/**
 * @route   POST /api/warehouses/
 * @desc    Create a new warehouse
 * @access  Private (warehouse:create)
 * @body    CreateWarehouseInput
 */
warehouseCrudRoutes.post(
  "/",
  requireTenantScope,
  authorize(["warehouse:create", "warehouse:manage"]),
  validateCreateWarehouseBody,
  createWarehouse,
);

/**
 * @route   PATCH /api/warehouses/:id/toggle-active
 * @desc    Toggle status of a warehouse
 * @access  Private (warehouse:update)

 */
warehouseCrudRoutes.patch(
  "/:id/toggle-active",
  requireTenantScope,
  authorize(["warehouse:update", "warehouse:manage"]),
  validateWarehouseId,
  toggleActiveWarehouse,
);

/**
 * @route   PATCH /api/warehouses/:id
 * @desc    Update a warehouse
 * @access  Private (warehouse:update)
 * @body    UpdateWarehouseInput
 */
warehouseCrudRoutes.patch(
  "/:id",
  requireTenantScope,
  authorize(["warehouse:update", "warehouse:manage"]),
  validateWarehouseId,
  validateUpdateWarehouseBody,
  updateWarehouse,
);

/**
 * @route   DELETE /api/warehouses/
 * @desc    Delete a warehouse
 * @access  Private (warehouse:delete)
 */
warehouseCrudRoutes.delete(
  "/:id",
  requireTenantScope,
  authorize(["warehouse:delete", "warehouse:manage"]),
  validateWarehouseId,
  deleteWarehouse,
);

export default warehouseCrudRoutes;
