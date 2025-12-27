import { ApiResponse } from "@/types/api";
import api from "../api";
import {
  CreateDocumentDTO,
  Document,
  DocumentListFilters,
} from "@/types/document";

export const getDocuments = async (
  params: DocumentListFilters
): Promise<ApiResponse<Document[]>> => {
  const response = await api.get(`/documents/`, { params });
  return response.data;
};

export const deleteDocument = async (
  documentId: number
): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/documents/${documentId}`);
  return response.data;
};

export const createDocument = async(
  formData: CreateDocumentDTO 
): Promise<ApiResponse<Document>> => {
  const response = await api.post("/documents/", {formData})
  return response.data;
}

export const updateDocument = async(
  documentId: number,
  formData: CreateDocumentDTO 
): Promise<ApiResponse<Document>> => {
  const response = await api.post(`/documents/${documentId}`, {formData})
  return response.data;
}