import { ApiResponse, PaginationQueryType } from "@/types/api";
import api from "../client";
import { Contact } from "@/types/contact";

export const getContact = async (
  contactId: number
): Promise<ApiResponse<Contact>> => {
  const response = await api.get(`/contacts/${contactId}`);
  return response.data;
};

export interface getContactParams {
  search?: string;
  companyId?: number;
  pagination?: PaginationQueryType;
}

export const getContacts = async (
  params: getContactParams = {
    pagination: {
      page: 1,
      limit: 20,
    },
  }
): Promise<ApiResponse<Contact[]>> => {
  const response = await api.get(`/contacts/`, { params });
  return response.data;
};

export const getContactsByCompanyId = async (
  companyId: number
): Promise<ApiResponse<Contact[]>> => {
  const response = await api.get(`/contacts/company/${companyId}`);
  return response.data;
};

export const createContact = async (
  payload: Partial<Contact>
): Promise<ApiResponse<Contact>> => {
  const response = await api.post(`/contacts`, payload);
  return response.data;
};

export const searchContacts = async (
  q: string,
  limit: number = 10
): Promise<ApiResponse<Contact[]>> => {
  const response = await api.get("/contacts/search", {
    params: { q, limit },
  });
  return response.data;
};

export const updateContact = async (
  contactId: number,
  payload: Partial<Contact>
): Promise<ApiResponse<Contact>> => {
  const response = await api.put(`/contacts/${contactId}`, payload);
  return response.data;
};

export const deleteContact = async (
  contactId: number
): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/contacts/${contactId}`);
  return response.data;
};

export const setPrimary = async (
  contactId: number
): Promise<ApiResponse<Contact>> => {
  const response = await api.post(`/contacts/${contactId}/set-primary`);
  return response.data;
};
