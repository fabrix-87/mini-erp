import express from "express";
import { authenticateToken, authorize } from "../middleware/auth";
import {
  validateAddressId,
  validateAddressQuery,
  validateCreateAddress,
  validateUpdateAddress,
} from "../validators/address";
import {
  createAddress,
  deleteAddress,
  getAddressById,
  getAllAddresses,
  setPrimaryAddress,
  updateAddress,
} from "../controllers/addresses";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorize(["address:read", "address:manage"]),
  validateAddressQuery,
  getAllAddresses
);
router.get(
  "/:id",
  authenticateToken,
  authorize(["address:read", "address:manage"]),
  validateAddressId,
  getAddressById
);
router.post(
  "/",
  authenticateToken,
  authorize(["address:create", "address:manage"]),
  validateCreateAddress,
  createAddress
);
router.put(
  "/:id",
  authenticateToken,
  authorize(["address:update", "address:manage"]),
  validateUpdateAddress,
  updateAddress
);
router.patch(
  "/:id/set-primary",
  authenticateToken,
  authorize(["address:update", "address:manage"]),
  validateAddressId,
  setPrimaryAddress
);
router.delete(
  "/:id",
  authenticateToken,
  authorize(["address:delete", "address:manage"]),
  validateAddressId,
  deleteAddress
);

export default router;
