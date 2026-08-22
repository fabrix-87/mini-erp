// packages/frontend/actions/customer-action.ts
"use server";

import { ActionResult, withAuth } from "@/lib/server/action";
import { customerRevalidation } from "@/lib/server/revalidate";
import {
  searchCustomers,
  getCustomerById,
  deleteCustomer,
  updateCustomerCompany,
  updateCustomer,
  createCustomer,
} from "@/services/server/customer-service";
import {
  CreateCustomerInput,
  Customer,
  UpdateCustomerCompanyInput,
  UpdateCustomerInput,
} from "@mini-erp/shared";
import { redirect } from "next/navigation";

/**
 * Search customer by query
 */
export async function searchCustomerAction(
  query: string,
  options?: {
    limit?: number;
  },
): Promise<ActionResult> {
  return withAuth(async () => {
    return await searchCustomers(query, {
      limit: options?.limit ?? 10,
      revalidate: 30,
    });
  }, "customer:read");
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new customer
 */
export async function createCustomerAction(
  data: CreateCustomerInput,
): Promise<ActionResult<Customer>> {
  const result = await withAuth(async () => {
    const response = await createCustomer(data);
    customerRevalidation.list();
    return response;
  }, "customer:create");
  return result;
}

/**
 * Update customer CRM-specific fields
 */
export async function updateCustomerAction(
  id: string,
  data: UpdateCustomerInput,
): Promise<ActionResult<Customer>> {
  const result = await withAuth(async () => {
    const response = await updateCustomer(id, data);
    customerRevalidation.customerWithList(id);
    return response;
  }, "customer:update");
  if (result.success) result.message = "Cliente aggiornato con successo";
  return result;
}

/**
 * Update company data of a customer
 */
export async function updateCustomerCompanyAction(
  id: string,
  data: UpdateCustomerCompanyInput,
): Promise<ActionResult<Customer>> {
  const result = await withAuth(async () => {
    const response = await updateCustomerCompany(id, data);
    customerRevalidation.customerWithList(id);
    return response;
  }, "customer:update");
  if (result.success) result.message = "Dati azienda aggiornati con successo";
  return result;
}

/**
 * Delete a customer and redirect to list
 */
export async function deleteCustomerAction(id: string): Promise<void> {
  const result = await withAuth(async () => {
    const response = await deleteCustomer(id);
    customerRevalidation.list();
    return response;
  }, "customer:delete");
  if (result.success) redirect("/customers");
  return;
}
