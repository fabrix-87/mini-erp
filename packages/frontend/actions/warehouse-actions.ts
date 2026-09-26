"use server";

import { ActionResult, withAuth } from "@/lib/server/action";
import { warehouseRevalidation } from "@/lib/server/revalidate";
import {
  createWarehouse,
  deleteWarehouse,
  updateWarehouse,
} from "@/services/server/warehouse-service";
import { CreateWarehouseFormValues, UpdateWarehouseFormValues, Warehouse } from "@mini-erp/shared";
import { ApiError } from "next/dist/server/api-utils";

// ============================================================================
// Server Actions
// ============================================================================

export async function createWarehouseAction(
  data: CreateWarehouseFormValues,
): Promise<ActionResult<Warehouse>> {
  return withAuth(async () => {
    const response = await createWarehouse(data);
    warehouseRevalidation.list();
    return response.data;
  }, "warehouse:create");
}

export async function updateWarehouseAction(
  data: UpdateWarehouseFormValues,
  id: string,
): Promise<ActionResult<Warehouse>> {
  return withAuth(async () => {
    const response = await updateWarehouse(data, id);
    warehouseRevalidation.warehouse(id);
    return response.data;
  }, "warehouse:update");
}

export async function deleteWarehouseAction(id: string): Promise<ActionResult<void>> {
  return withAuth(async () => {
    const response = await deleteWarehouse(id);
    if (response.status !== "success") {
      throw new ApiError(409, response.message ?? "Error");
    }
    warehouseRevalidation.list()
    return;
  }, "warehouse:delete");
}
