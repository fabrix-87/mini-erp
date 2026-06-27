import { authorize } from "../middleware/auth-middleware";
import {
  validateAddressId,
  validateAddressQuery,
  validateCreateAddress,
  validateSetPrimaryAddress,
  validateUpdateAddress,
} from "../validators/address-validator";
import {
  createAddress,
  deleteAddress,
  getAddressById,
  getAllAddresses,
  setPrimaryAddress,
  updateAddress,
} from "../controllers/address-controller";
import { createHonoApp } from "@/lib/hono-app";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const addressRoutes = createHonoApp();

addressRoutes.get(
  "/",
  requireTenantScope,
  authorize(["address:read", "address:manage"]),
  validateAddressQuery,
  getAllAddresses,
);
addressRoutes.get(
  "/:id",
  requireTenantScope,
  authorize(["address:read", "address:manage"]),
  validateAddressId,
  getAddressById,
);
addressRoutes.post(
  "/",
  requireTenantScope,
  authorize(["address:create", "address:manage"]),
  validateCreateAddress,
  createAddress,
);
addressRoutes.put(
  "/:id",
  requireTenantScope,
  authorize(["address:update", "address:manage"]),
  validateAddressId,
  validateUpdateAddress,
  updateAddress,
);
addressRoutes.patch(
  "/:id/set-primary",
  requireTenantScope,
  authorize(["address:update", "address:manage"]),
  validateAddressId,
  setPrimaryAddress,
);
addressRoutes.delete(
  "/:id",
  requireTenantScope,
  authorize(["address:delete", "address:manage"]),
  validateAddressId,
  validateSetPrimaryAddress,
  deleteAddress,
);

export default addressRoutes;
