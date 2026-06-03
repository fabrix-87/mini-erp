"use server";

import {
  createCompanyContact,
  updateCompanyContact,
  deleteCompanyContact,
} from "@/services/server/company-contact-service";
import type {
  CreateCompanyContactInput,
  UpdateCompanyContactInput,
  Contact,
} from "@mini-erp/shared";
import { ActionResult, withAuth } from "@/lib/server/action";
import { contactRevalidation } from "@/lib/server/revalidate";

// ============================================================================
// CREATE
// ============================================================================

/**
 * Server Action: creates a new CompanyContact association.
 * Revalidates the contact detail page and the contacts list.
 *
 * @param data - { contactId, companyId, position?, department?, isPrimaryContact? }
 */
export async function createCompanyContactAction(
  data: CreateCompanyContactInput,
): Promise<ActionResult<Contact>> {
  return withAuth(async () => {
    const response = await createCompanyContact(data);
    contactRevalidation.contactWithList(data.contactId);
    return response;
  }, "contact:update");
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Server Action: updates position, department and/or isPrimaryContact
 * for an existing CompanyContact association.
 * Revalidates the contact detail page and the contacts list.
 *
 * @param contactId - The contact ID
 * @param companyId - The company ID
 * @param data      - Fields to update: position?, department?, isPrimaryContact?
 */
export async function updateCompanyContactAction(
  contactId: number,
  companyId: number,
  data: UpdateCompanyContactInput,
): Promise<ActionResult<Contact>> {
  return withAuth(async () => {
    const response = await updateCompanyContact(contactId, companyId, data);
    contactRevalidation.contactWithList(contactId);
    return response;
  }, "contact:update");
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Server Action: removes a CompanyContact association.
 * Revalidates the contact detail page and the contacts list.
 *
 * @param contactId - The contact ID
 * @param companyId - The company ID
 */
export async function deleteCompanyContactAction(
  contactId: number,
  companyId: number,
): Promise<ActionResult<void>> {
  return withAuth(async () => {
    await deleteCompanyContact(contactId, companyId);
    contactRevalidation.contactWithList(contactId);
  }, "contact:delete");
}
