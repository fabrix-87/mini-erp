// packages/frontend/actions/supplier-action.ts
"use server";

import { type ActionResult, withAuth } from "@/lib/server/action";
import { supplierRevalidation } from "@/lib/server/revalidate";
import {
  searchSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  updateSupplierCompany,
  deleteSupplier,
} from "@/services/server/supplier-service";
import { redirect } from "next/navigation";
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
  UpdateSupplierCompanyInput,
  Supplier,
} from "@mini-erp/shared";
import { SupplierSingleApiResponse } from "@/types/supplier-types";

// ============================================================================
// READ
// ============================================================================

/**
 * Search suppliers by query string
 */
export async function searchSupplierAction(
  query: string,
  options?: { limit?: number },
): Promise<ActionResult> {
  return withAuth(async () => {
    return await searchSuppliers(query, {
      limit: options?.limit ?? 10,
      revalidate: 30,
    });
  }, "supplier:read");
}

/**
 * Get supplier by ID
 */
export async function getSupplierByIdAction(id: number): Promise<ActionResult> {
  return withAuth(async () => {
    return await getSupplierById(id, false);
  }, "supplier:read");
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new supplier
 */
export async function createSupplierAction(
  data: CreateSupplierInput,
): Promise<ActionResult<Supplier>> {
  const result = await withAuth(async () => {
    const response = await createSupplier(data);
    supplierRevalidation.list();
    return response;
  }, "supplier:create");
  return result;
}

/**
 * Update supplier procurement-specific fields
 */
export async function updateSupplierAction(
  id: number,
  data: UpdateSupplierInput,
): Promise<ActionResult<Supplier>> {
  const result = await withAuth(async () => {
    const response = await updateSupplier(id, data);
    supplierRevalidation.supplierWithList(id);
    return response;
  }, "supplier:update");
  if (result.success) result.message = "Fornitore aggiornato con successo";
  return result;
}

/**
 * Update company data of a supplier
 */
export async function updateSupplierCompanyAction(
  id: number,
  data: UpdateSupplierCompanyInput,
): Promise<ActionResult<Supplier>> {
  const result = await withAuth(async () => {
    const response = await updateSupplierCompany(id, data);
    supplierRevalidation.supplierWithList(id);
    return response;
  }, "supplier:update");
  if (result.success) result.message = "Dati azienda aggiornati con successo";
  return result;
}

/**
 * Delete a supplier and redirect to list
 */
export async function deleteSupplierAction(id: number): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const response = await deleteSupplier(id);
    supplierRevalidation.list();
    return response;
  }, "supplier:delete");
  if (result.success) redirect("/suppliers");
  return result;
}
