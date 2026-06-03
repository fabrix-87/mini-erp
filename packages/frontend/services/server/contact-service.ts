// services/server/contact.ts
"use server";

import { serverApi } from "@/lib/server/api";
import type { ApiResponse } from "@/types/api";
import type {
  CreateContactInput,
  UpdateContactInput,
  ContactQueryInput,
  ContactListApiResponse,
  ContactSingleApiResponse,
  ContactOperationApiResponse,
  ContactDeleteApiResponse,
} from "@/types/contact-types";
import { Contact } from "@mini-erp/shared";

// ============================================================================
// QUERY BUILDER (helper privato, non server action)
// ============================================================================

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

// ============================================================================
// SERVER ACTIONS - Esportate come funzioni individuali
// ============================================================================

/**
 * Ottieni tutti i contatti con filtri e paginazione
 */
export async function getAllContacts(params: ContactQueryInput): Promise<ContactListApiResponse> {
  const queryString = buildQueryString(params);
  const url = queryString ? `/contacts?${queryString}` : "/contacts";
  return await serverApi.get<ContactListApiResponse>(url, { unwrapData: false });
}

/**
 * Ottieni contatti per company
 */
export async function getContactsByCompany(
  companyId: number,
  active?: boolean,
): Promise<ContactListApiResponse> {
  const url = `/contacts/company/${companyId}${active !== undefined ? `?active=${active}` : ""}`;
  return serverApi.get<ContactListApiResponse>(url);
}

/**
 * Ottieni contatto primario per company
 */
export async function getPrimaryContactByCompany(
  companyId: number,
): Promise<ContactSingleApiResponse> {
  return serverApi.get<ContactSingleApiResponse>(`/contacts/company/${companyId}/primary`);
}

/**
 * Ottieni singolo contatto per ID
 */
export async function getContactById(id: number): Promise<Contact> {
  return serverApi.get<Contact>(`/contacts/${id}`);
}

/**
 * Crea nuovo contatto
 */
export async function createContact(
  contactData: CreateContactInput,
): Promise<Contact> {
  return serverApi.post<Contact>("/contacts", contactData);
}

/**
 * Aggiorna contatto esistente
 */
export async function updateContact(
  id: number,
  contactData: UpdateContactInput,
): Promise<Contact> {
  return serverApi.put<Contact>(`/contacts/${id}`, contactData);
}

/**
 * Attiva/Disattiva contatto
 */
export async function toggleContactActive(
  id: number,
  active: boolean,
): Promise<ContactOperationApiResponse> {
  return serverApi.patch<ContactOperationApiResponse>(`/contacts/${id}/toggle-active`, { active });
}

/**
 * Imposta contatto come primario
 */
export async function setContactAsPrimary(id: number): Promise<ContactOperationApiResponse> {
  return serverApi.patch<ContactOperationApiResponse>(`/contacts/${id}/set-primary`);
}

/**
 * Elimina contatto
 */
export async function deleteContact(id: number): Promise<ContactDeleteApiResponse> {
  return serverApi.delete<ContactDeleteApiResponse>(`/contacts/${id}`);
}

/**
 * Verifica unicità email
 */
export async function checkContactEmailUnique(
  email: string,
  companyId: number,
  contactId?: number,
): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      email,
      companyId: companyId.toString(),
      ...(contactId && { contactId: contactId.toString() }),
    });
    const resp = await serverApi.get<ApiResponse<{ unique: boolean }>>(
      `/contacts/check-email?${params}`,
    );
    return resp.data.unique;
  } catch (error) {
    return false;
  }
}

/**
 * Export contatti in CSV
 */
export async function exportContactsCSV(params: ContactQueryInput): Promise<Blob> {
  const queryString = buildQueryString(params);
  const url = `/contacts/export/csv${queryString ? `?${queryString}` : ""}`;
  return serverApi.get(url);
}

/**
 * Export contatti in Excel
 */
export async function exportContactsExcel(params: ContactQueryInput): Promise<Blob> {
  const queryString = buildQueryString(params);
  const url = `/contacts/export/excel${queryString ? `?${queryString}` : ""}`;
  return serverApi.get(url);
}

/**
 * Bulk activate contatti
 */
export async function bulkActivateContacts(
  contactIds: number[],
): Promise<ContactOperationApiResponse> {
  return serverApi.patch<ContactOperationApiResponse>("/contacts/bulk/activate", { contactIds });
}

/**
 * Bulk deactivate contatti
 */
export async function bulkDeactivateContacts(
  contactIds: number[],
): Promise<ContactOperationApiResponse> {
  return serverApi.patch<ContactOperationApiResponse>("/contacts/bulk/deactivate", { contactIds });
}

/**
 * Bulk delete contatti
 */
export async function bulkDeleteContacts(
  contactIds: number[],
): Promise<ContactOperationApiResponse> {
  return serverApi.delete<ContactOperationApiResponse>("/contacts/bulk/delete", {
    data: { contactIds },
  });
}
