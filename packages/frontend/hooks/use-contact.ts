"use client";

import { useState, useCallback, useTransition } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import contactService from "@/services/client/contact";
import { contactKeys } from "./contact-keys";
import type {
  ContactQueryInput,
  CreateContactInput,
  UpdateContactInput,
  UseContactReturn,
} from "@/types/contact-types";
import {
  createContactAction,
  deleteContactAction,
  toggleContactActiveAction,
  updateContactAction,
} from "@/actions/contact-actions";

// Re-export per comodità
export { contactKeys };

/*
// ============================================================================
// HOOK: useContacts (Lista con filtri e paginazione)
// ============================================================================

export function useContactsList(params: ContactQueryInput) {
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: contactKeys.list(params),
    queryFn: () => contactService.getAll(params),
    staleTime: 5 * 60 * 1000,
  });

  return {
    contacts: response?.data || [],
    pagination: response?.pagination || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
  };
}

export function useContacts(initialParams?: ContactQueryInput): UseContactsReturn {
  const [params, setParams] = useState<ContactQueryInput>(
    initialParams || {
      page: 1,
      limit: 20,
      sortBy: 'firstName',
      sortOrder: 'asc',
    }
  );

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: contactKeys.list(params),
    queryFn: () => contactService.getAll(params),
    staleTime: 5 * 60 * 1000,
  });

  const contacts = response?.data || [];
  const pagination = response?.pagination || null;

  const setFilters = useCallback((filters: ContactFilters) => {
    setParams((prev) => ({
      ...prev,
      ...filters,
      page: 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setParams({
      page: 1,
      limit: params.limit,
      sortBy: 'firstName',
      sortOrder: 'asc',
    });
  }, [params.limit]);

  const setSort = useCallback((field: ContactSortField, order: SortOrder) => {
    setParams((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: order,
    }));
  }, []);

  const filters: ContactFilters = {
    search: params.search,
    companyId: params.companyId,
    active: params.active,
    isPrimaryContact: params.isPrimaryContact,
    department: params.department,
    position: params.position,
  };

  return {
    contacts,
    loading: isLoading,
    error: error?.message || null,
    pagination,
    filters,
    setFilters,
    resetFilters,
    refetch: async () => {
      await refetch();
    },
    sort: {
      field: params.sortBy || 'firstName',
      order: params.sortOrder || 'asc',
    },
    setSort,
  };
}
*/

// ============================================================================
// HOOK: useContact (Singolo contatto)
// ============================================================================

export function useContact(id: number): UseContactReturn {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => contactService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    contact: response?.data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
  };
}

// ============================================================================
// HOOK: useContactsByCompany
// ============================================================================

export function useContactsByCompany(companyId: number, active?: boolean) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: contactKeys.byCompany(companyId),
    queryFn: () => contactService.getByCompany(companyId, active),
    enabled: !!companyId && companyId > 0, // Disabilita se companyId è 0 o undefined
  });

  return {
    contacts: response?.data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

// ============================================================================
// HOOK: usePrimaryContact
// ============================================================================

export function usePrimaryContact(companyId: number) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: contactKeys.primaryByCompany(companyId),
    queryFn: () => contactService.getPrimaryByCompany(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    contact: response?.data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

// ============================================================================
// HOOK: useContactMutations (CRUD Operations)
// ============================================================================

export function useContactMutations() {
  const [isPending, startTransition] = useTransition();

  const runAction = <T>(action: () => Promise<T>) =>
    new Promise<T>((resolve, reject) => {
      startTransition(() => {
        action().then(resolve).catch(reject);
      });
    });

  return {
    createContact: async (data: CreateContactInput) => {
      const response = await runAction(() => createContactAction(data));
      if (response.message) toast.success(response.message);
      return response.data;
    },

    updateContact: async (id: number, data: UpdateContactInput) => {
      const response = await runAction(() => updateContactAction(id, data));
      if (response.message) toast.success(response.message);
      return response.data;
    },

    deleteContact: async (id: number) => {
      const response = await runAction(() => deleteContactAction(id));
      if (response.success) toast.success("Contatto eliminato");
      else toast.error(response.message ?? "Errore durante eliminazione contatto");
    },

    toggleActive: async (id: number, active: boolean) => {
      const response = await runAction(() => toggleContactActiveAction(id, active));
      if (response.success) toast.success("Stato modificato");
    },

    isPending: isPending,
  };
}

// ============================================================================
// HOOK: useContactExport ----- TODO
// ============================================================================

export function useContactExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportCSV = async (params: ContactQueryInput) => {
    setIsExporting(true);
    try {
      const blob = await contactService.exportCSV(params);
      const filename = `contacts_${new Date().toISOString().split("T")[0]}.csv`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Export CSV completato con successo");
    } catch (error: any) {
      console.error("Export CSV error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportExcel = async (params: ContactQueryInput): Promise<void> => {
    setIsExporting(true);
    try {
      const blob = await contactService.exportExcel(params);
      const filename = `contacts_${new Date().toISOString().split("T")[0]}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Export Excel completato con successo");
    } catch (error: any) {
      console.error("Export Excel error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportCSV, exportExcel, isExporting };
}

// ============================================================================
// HOOK: useContactBulkOperations
// ============================================================================

export function useContactBulkOperations() {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const bulkActivate = async (contactIds: number[]) => {
    setIsProcessing(true);
    try {
      const response = await contactService.bulkActivate(contactIds);
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      if (response.message) toast.success(response.message);
    } catch (error: any) {
      console.error("Bulk activate error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const bulkDeactivate = async (contactIds: number[]) => {
    setIsProcessing(true);
    try {
      const response = await contactService.bulkDeactivate(contactIds);
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      if (response.message) toast.success(response.message);
    } catch (error: any) {
      console.error("Bulk deactivate error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const bulkDelete = async (contactIds: number[]) => {
    setIsProcessing(true);
    try {
      const response = await contactService.bulkDelete(contactIds);
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      if (response.message) toast.success(response.message);
    } catch (error: any) {
      console.error("Bulk delete error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return { bulkActivate, bulkDeactivate, bulkDelete, isProcessing };
}

// ============================================================================
// HOOK: useContactValidation
// ============================================================================

export function useContactValidation() {
  const [isValidating, setIsValidating] = useState(false);

  const validateEmailUnique = async (
    email: string,
    contactId?: number,
  ): Promise<boolean> => {
    setIsValidating(true);
    try {
      return await contactService.checkEmailUnique(email, contactId);
    } catch (error) {
      console.error("Email validation error:", error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return { validateEmailUnique, isValidating };
}
