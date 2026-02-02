import { z } from "zod";

export const WarehouseTypeSchema = z.enum(["PHYSICAL", "VIRTUAL"]);
export const MovementTypeSchema = z.enum([
  "PURCHASE",
  "SALE",
  "RETURN_IN",
  "RETURN_OUT",
  "ADJUSTMENT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "INVENTORY_START",
]);
