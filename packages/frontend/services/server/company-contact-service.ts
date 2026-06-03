"use server";

import { serverApi } from "@/lib/server/api";
import type {
  CreateCompanyContactInput,
  UpdateCompanyContactInput,
  Contact,
} from "@mini-erp/shared";

// ============================================================================
// CREATE
// ============================================================================

/**
 * Creates a new CompanyContact association between an existing contact and a company.
 *
 * @param data - { contactId, companyId, position?, department?, isPrimaryContact? }
 * @returns The updated Contact with all company associations
 */
export async function createCompanyContact(data: CreateCompanyContactInput): Promise<Contact> {
  return serverApi.post<Contact>("/company-contacts", data);
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Updates position, department and/or isPrimaryContact for an existing CompanyContact.
 * If isPrimaryContact is set to true, demotes any other primary for the same company.
 *
 * @param contactId - The contact ID
 * @param companyId - The company ID
 * @param data      - Fields to update: position?, department?, isPrimaryContact?
 * @returns The updated Contact with all company associations
 */
export async function updateCompanyContact(
  contactId: number,
  companyId: number,
  data: UpdateCompanyContactInput,
): Promise<Contact> {
  return serverApi.patch<Contact>(`/company-contacts/${contactId}/${companyId}`, data);
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Removes a CompanyContact association.
 *
 * @param contactId - The contact ID
 * @param companyId - The company ID
 */
export async function deleteCompanyContact(contactId: number, companyId: number): Promise<void> {
  return serverApi.delete<void>(`/company-contacts/${contactId}/${companyId}`);
}
