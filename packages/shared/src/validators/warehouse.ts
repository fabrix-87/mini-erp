import { z } from "zod";

export const warehouseTypeSchema = z.enum(["PHYSICAL", "VIRTUAL"]);
export const movementTypeSchema = z.enum([
  "PURCHASE",
  "SALE",
  "RETURN_IN",
  "RETURN_OUT",
  "ADJUSTMENT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "INVENTORY_START",
]);
