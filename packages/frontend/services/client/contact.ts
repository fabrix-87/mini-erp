// services/client/contact.ts
'use client'

import api from '@/lib/client/api';
import type { ApiResponse, PaginationInfo } from '@/types/api';
import type {
  CreateContactInput,
  UpdateContactInput,
  ContactQueryInput,
  ContactListApiResponse,
  ContactSingleApiResponse,
  ContactOperationApiResponse,
  ContactDeleteApiResponse,
} from '@/types/contact-types';


// ============================================================================
// QUERY BUILDER
// ============================================================================

const buildQueryString = (params: ContactQueryInput): string => {
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
};

// ============================================================================
// CLIENT CONTACT SERVICES (Browser only - React Query)
// ============================================================================

export const clientContactService = {
  /**
   * Ottieni tutti i contatti con filtri e paginazione
   * ⚠️ Solo per uso client-side (React Query)
   */
  async getAll(params: ContactQueryInput): Promise<ContactListApiResponse> {
    const queryString = buildQueryString(params);
    const url = queryString ? `/contacts?${queryString}` : '/contacts';
    const { data } = await api.get<ContactListApiResponse>(url);
    return data;
  },

  /**
   * Ottieni contatti per company
   */
  async getByCompany(companyId: number, active?: boolean): Promise<ContactListApiResponse> {
    const url = `/contacts/company/${companyId}${active !== undefined ? `?active=${active}` : ''}`;
    const { data } = await api.get<ContactListApiResponse>(url);
    return data;
  },

  /**
   * Ottieni contatto primario per company
   */
  async getPrimaryByCompany(companyId: number): Promise<ContactSingleApiResponse> {
    const { data } = await api.get<ContactSingleApiResponse>(
      `/contacts/company/${companyId}/primary`
    );
    return data;
  },

  /**
   * Ottieni singolo contatto per ID
   */
  async getById(id: number): Promise<ContactSingleApiResponse> {
    const { data } = await api.get<ContactSingleApiResponse>(`/contacts/${id}`);
    return data;
  },

  /**
   * Crea nuovo contatto
   */
  async create(contactData: CreateContactInput): Promise<ContactSingleApiResponse> {
    const { data } = await api.post<ContactSingleApiResponse>('/contacts', contactData);
    return data;
  },

  /**
   * Aggiorna contatto esistente
   */
  async update(id: number, contactData: UpdateContactInput): Promise<ContactSingleApiResponse> {
    const { data } = await api.put<ContactSingleApiResponse>(
      `/contacts/${id}`,
      contactData
    );
    return data;
  },

  /**
   * Attiva/Disattiva contatto
   */
  async toggleActive(id: number, active: boolean): Promise<ContactOperationApiResponse> {
    const { data } = await api.patch<ContactOperationApiResponse>(
      `/contacts/${id}/toggle-active`,
      { active }
    );
    return data;
  },

  /**
   * Imposta contatto come primario
   */
  async setPrimary(id: number): Promise<ContactOperationApiResponse> {
    const { data } = await api.patch<ContactOperationApiResponse>(
      `/contacts/${id}/set-primary`
    );
    return data;
  },

  /**
   * Elimina contatto
   */
  async delete(id: number): Promise<ContactDeleteApiResponse> {
    const { data } = await api.delete<ContactDeleteApiResponse>(`/contacts/${id}`);
    return data;
  },

  /**
   * Verifica unicità email
   */
  async checkEmailUnique(
    email: string,
    companyId: number,
    contactId?: number
  ): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        email,
        companyId: companyId.toString(),
        ...(contactId && { contactId: contactId.toString() }),
      });
      const resp = await api.get<ApiResponse<{ unique: boolean }>>(
        `/contacts/check-email?${params}`
      );
      return resp.data.data.unique;
    } catch (error) {
      return false;
    }
  },

  /**
   * Export contatti in CSV
   */
  async exportCSV(params: ContactQueryInput): Promise<Blob> {
    const queryString = buildQueryString(params);
    const url = `/contacts/export/csv${queryString ? `?${queryString}` : ''}`;
    const { data } = await api.get(url, { responseType: 'blob' });
    return data;
  },

  /**
   * Export contatti in Excel
   */
  async exportExcel(params: ContactQueryInput): Promise<Blob> {
    const queryString = buildQueryString(params);
    const url = `/contacts/export/excel${queryString ? `?${queryString}` : ''}`;
    const { data } = await api.get(url, { responseType: 'blob' });
    return data;
  },

  /**
   * Bulk activate contatti
   */
  async bulkActivate(contactIds: number[]): Promise<ContactOperationApiResponse> {
    const { data } = await api.patch<ContactOperationApiResponse>(
      '/contacts/bulk/activate',
      { contactIds }
    );
    return data;
  },

  /**
   * Bulk deactivate contatti
   */
  async bulkDeactivate(contactIds: number[]): Promise<ContactOperationApiResponse> {
    const { data } = await api.patch<ContactOperationApiResponse>(
      '/contacts/bulk/deactivate',
      { contactIds }
    );
    return data;
  },

  /**
   * Bulk delete contatti
   */
  async bulkDelete(contactIds: number[]): Promise<ContactOperationApiResponse> {
    const { data } = await api.delete<ContactOperationApiResponse>(
      '/contacts/bulk/delete',
      { data: { contactIds } }
    );
    return data;
  },
};

export default clientContactService;
