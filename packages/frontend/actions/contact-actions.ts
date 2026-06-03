"use server";

import { revalidatePath } from "next/cache";
import {
  createContact,
  updateContact,
  deleteContact,
  toggleContactActive,
  setContactAsPrimary,
  bulkActivateContacts,
  bulkDeactivateContacts,
  bulkDeleteContacts,
} from "@/services/server/contact-service";
import type {
  ContactDeleteApiResponse,
  ContactOperationApiResponse,
  ContactQueryInput,
  ContactSingleApiResponse,
  CreateContactInput,
  UpdateContactInput,
} from "@/types/contact-types";
import { Contact } from "@mini-erp/shared";
import { ActionResult, withAuth } from "@/lib/server/action";
import { contactRevalidation } from "@/lib/server/revalidate";

/**
 * Server Action per creare contatto
 */
export async function createContactAction(
  data: CreateContactInput,
): Promise<ActionResult<Contact>> {
  return withAuth(async () => {
    const response = createContact(data);
    contactRevalidation.list();
    return response;
  }, "contact:create");
}

/**
 * Server Action per aggiornare contatto
 */
export async function updateContactAction(
  id: number,
  data: UpdateContactInput,
): Promise<ActionResult<Contact>> {
  return withAuth(async () => {
    const response = updateContact(id, data);
    contactRevalidation.contactWithList(id);
    return response;
  }, "contact:update");
}

/**
 * Server Action per eliminare contatto
 */
export async function deleteContactAction(
  id: number,
): Promise<ActionResult<ContactDeleteApiResponse>> {
  return withAuth(async () => {
    const response = deleteContact(id);
    contactRevalidation.list();
    return response;
  }, "contact:delete");
}

/**
 * Server Action per toggle active
 */
export async function toggleContactActiveAction(
  id: number,
  active: boolean,
): Promise<ActionResult<ContactOperationApiResponse>> {
  return withAuth(async () => {
    const response = await toggleContactActive(id, active);
    contactRevalidation.contactWithList(id);
    return response;
  }, "contact:update");
}

/**
 * Server Action per set primary
 */
export async function setContactPrimaryAction(id: number) {
  try {
    const response = await setContactAsPrimary(id);
    revalidatePath("/contacts");
    revalidatePath(`/contacts/${id}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Server Action per bulk operations
 */
export async function bulkActivateContactsAction(contactIds: number[]) {
  try {
    const response = await bulkActivateContacts(contactIds);
    revalidatePath("/contacts");
    return { success: true, message: response.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkDeactivateContactsAction(contactIds: number[]) {
  try {
    const response = await bulkDeactivateContacts(contactIds);
    revalidatePath("/contacts");
    return { success: true, message: response.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkDeleteContactsAction(contactIds: number[]) {
  try {
    const response = await bulkDeleteContacts(contactIds);
    revalidatePath("/contacts");
    return { success: true, message: response.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function buildQueryString(params: ContactQueryInput): string {
  const query = new URLSearchParams();

  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.search) query.append("search", params.search);
  if (params.companyId) query.append("companyId", params.companyId.toString());
  if (params.active !== undefined) query.append("active", params.active.toString());
  if (params.isPrimaryContact !== undefined)
    query.append("isPrimaryContact", params.isPrimaryContact.toString());
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.sortOrder) query.append("sortOrder", params.sortOrder);
  if (params.department) query.append("department", params.department);
  if (params.position) query.append("position", params.position);

  return query.toString();
}
