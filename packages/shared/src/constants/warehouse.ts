import { z } from "zod";
import { MovementTypeSchema, WarehouseTypeSchema } from "../validators";

export type WarehouseType = z.infer<typeof WarehouseTypeSchema>;
export type MovementType = z.infer<typeof MovementTypeSchema>;
