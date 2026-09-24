import { getAllWarehouses } from "@/controllers/warehouse-controller";
import { createHonoApp } from "@/lib/hono-app";
import { authorize } from "@/middleware/auth-middleware";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";
import { validateWarehouseQuery } from "@/validators/warehouse-validator";

const warehouseCrudRoutes = createHonoApp();

/**
 * @route   GET /api/warehouse/
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

export default warehouseCrudRoutes;
