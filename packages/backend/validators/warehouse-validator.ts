import { validateQuery, validateParams } from "../middleware/validation-middleware";
import {
  warehouseIdParamSchema,
  warehouseStatsQuerySchema,
  warehouseBatchStatsQuerySchema,
  warehouseVirtualStatsQuerySchema,
  warehouseQuerySchema,
} from "@mini-erp/shared/validators/warehouse";

/** Validates the :warehouseId route parameter (CUID string). */
export const validateWarehouseId = validateParams(warehouseIdParamSchema, "Warehouse ID parameter");

/** Validates query parameters for on-hand, reserved, and available stats endpoints. */
export const validateWarehouseStatsQuery = validateQuery(
  warehouseStatsQuerySchema,
  "Warehouse stats query parameters",
);

/** Validates query parameters for batch-level stats. */
export const validateBatchStatsQuery = validateQuery(
  warehouseBatchStatsQuerySchema,
  "Warehouse batch stats query parameters",
);

/** Validates query parameters for virtual warehouse stats. */
export const validateVirtualStatsQuery = validateQuery(
  warehouseVirtualStatsQuerySchema,
  "Virtual warehouse stats query parameters",
);

export const validateWarehouseQuery = validateQuery(
  warehouseQuerySchema,
  "Warehouse query parameters",
);
