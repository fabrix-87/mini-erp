'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import contactService from '@/services/contact-services';
import type { CreateContactInput, UpdateContactInput } from '@/types/contact';

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
    const response = await contactService.create(data);
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
    const response = await contactService.update(id, data);
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
    await contactService.delete(id);
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
    const response = await contactService.toggleActive(id, active);
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
    const response = await contactService.setPrimary(id);
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
    const response = await contactService.bulkActivate(contactIds);
    revalidatePath('/contacts');
    return { success: true, message: response.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkDeactivateContactsAction(contactIds: number[]) {
  try {
    const response = await contactService.bulkDeactivate(contactIds);
    revalidatePath('/contacts');
    return { success: true, message: response.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkDeleteContactsAction(contactIds: number[]) {
  try {
    const response = await contactService.bulkDelete(contactIds);
    revalidatePath('/contacts');
    return { success: true, message: response.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
