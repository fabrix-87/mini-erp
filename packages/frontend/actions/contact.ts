'use server';

import { revalidatePath } from 'next/cache';
import {
  createContact,
  updateContact,
  deleteContact,
  toggleContactActive,
  setContactAsPrimary,
  bulkActivateContacts,
  bulkDeactivateContacts,
  bulkDeleteContacts,
} from '@/services/server/contact';
import type { ContactQueryInput, CreateContactInput, UpdateContactInput } from '@/types/contact';

/**
 * Revalida cache contatti dopo mutazioni
 */
export async function revalidateContacts() {
  revalidatePath('/contacts');
}

/**
 * Revalida cache singolo contatto
 */
export async function revalidateContact(id: number) {
  revalidatePath(`/contacts/${id}`);
  revalidatePath('/contacts');
}

/**
 * Server Action per creare contatto
 */
export async function createContactAction(data: CreateContactInput) {
  try {
    const response = await createContact(data);
    revalidatePath('/contacts');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Server Action per aggiornare contatto
 */
export async function updateContactAction(id: number, data: UpdateContactInput) {
  try {
    const response = await updateContact(id, data);
    revalidatePath(`/contacts/${id}`);
    revalidatePath('/contacts');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Server Action per eliminare contatto
 */
export async function deleteContactAction(id: number) {
  try {
    await deleteContact(id);
    revalidatePath('/contacts');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Server Action per toggle active
 */
export async function toggleContactActiveAction(id: number, active: boolean) {
  try {
    const response = await toggleContactActive(id, active);
    revalidatePath('/contacts');
    revalidatePath(`/contacts/${id}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Server Action per set primary
 */
export async function setContactPrimaryAction(id: number) {
  try {
    const response = await setContactAsPrimary(id);
    revalidatePath('/contacts');
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
    revalidatePath('/contacts');
    return { success: true, message: response.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkDeactivateContactsAction(contactIds: number[]) {
  try {
    const response = await bulkDeactivateContacts(contactIds);
    revalidatePath('/contacts');
    return { success: true, message: response.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkDeleteContactsAction(contactIds: number[]) {
  try {
    const response = await bulkDeleteContacts(contactIds);
    revalidatePath('/contacts');
    return { success: true, message: response.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


function buildQueryString(params: ContactQueryInput): string {
  const query = new URLSearchParams();
  
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.search) query.append('search', params.search);
  if (params.companyId) query.append('companyId', params.companyId.toString());
  if (params.active !== undefined) query.append('active', params.active.toString());
  if (params.isPrimaryContact !== undefined) query.append('isPrimaryContact', params.isPrimaryContact.toString());
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);
  if (params.department) query.append('department', params.department);
  if (params.position) query.append('position', params.position);
  
  return query.toString();
}