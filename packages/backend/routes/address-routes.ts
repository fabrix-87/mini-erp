import { authenticateToken, authorize } from "../middleware/auth-middleware";
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

const addressRoutes = createHonoApp();

addressRoutes.get(
  "/",
  authenticateToken,
  authorize(["address:read", "address:manage"]),
  validateAddressQuery,
  getAllAddresses,
);
addressRoutes.get(
  "/:id",
  authenticateToken,
  authorize(["address:read", "address:manage"]),
  validateAddressId,
  getAddressById,
);
addressRoutes.post(
  "/",
  authenticateToken,
  authorize(["address:create", "address:manage"]),
  validateCreateAddress,
  createAddress,
);
addressRoutes.put(
  "/:id",
  authenticateToken,
  authorize(["address:update", "address:manage"]),
  validateAddressId,
  validateUpdateAddress,
  updateAddress,
);
addressRoutes.patch(
  "/:id/set-primary",
  authenticateToken,
  authorize(["address:update", "address:manage"]),
  validateAddressId,
  setPrimaryAddress,
);
addressRoutes.delete(
  "/:id",
  authenticateToken,
  authorize(["address:delete", "address:manage"]),
  validateAddressId,
  validateSetPrimaryAddress,
  deleteAddress,
);

export default addressRoutes;
