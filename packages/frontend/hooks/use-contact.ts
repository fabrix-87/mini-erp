'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import contactService from '@/services/client/contact';
import { contactKeys } from './contact-keys';
import type {
  ContactQueryParams,
  ContactFilters,
  ContactSortField,
  SortOrder,
  CreateContactInput,
  UpdateContactInput,
  UseContactsReturn,
  UseContactReturn,
  UseContactMutationsReturn,
} from '@/types/contact';

// Re-export per comodità
export { contactKeys };

// ============================================================================
// HOOK: useContacts (Lista con filtri e paginazione)
// ============================================================================

export function useContactsList(params: ContactQueryParams) {
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

export function useContacts(initialParams?: ContactQueryParams): UseContactsReturn {
  const [params, setParams] = useState<ContactQueryParams>(
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

// ============================================================================
// HOOK: useContact (Singolo contatto)
// ============================================================================

export function useContact(id: number): UseContactReturn {
  const { data: response, isLoading, error, refetch } = useQuery({
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
  const { data: response, isLoading, error, refetch } = useQuery({
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
  const { data: response, isLoading, error, refetch } = useQuery({
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

export function useContactMutations(): UseContactMutationsReturn {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateContactInput) => contactService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      if (response.data.companyId) {
        queryClient.invalidateQueries({
          queryKey: contactKeys.byCompany(response.data.companyId)
        });
      }
      if (response.message) toast.success(response.message);
    },
    onError: (error: any) => {
      console.error('Create contact error:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateContactInput }) =>
      contactService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(response.data.id) });
      if (response.data.companyId) {
        queryClient.invalidateQueries({
          queryKey: contactKeys.byCompany(response.data.companyId)
        });
      }
      if (response.message) toast.success(response.message);
    },
    onError: (error: any) => {
      console.error('Update contact error:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contactService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
      if (response.message) toast.success(response.message);
    },
    onError: (error: any) => {
      console.error('Delete contact error:', error);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      contactService.toggleActive(id, active),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(response.data.id) });
      if (response.data.companyId) {
        queryClient.invalidateQueries({
          queryKey: contactKeys.byCompany(response.data.companyId)
        });
      }
      if (response.message) toast.success(response.message);
    },
    onError: (error: any) => {
      console.error('Toggle contact error:', error);
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (id: number) => contactService.setPrimary(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      if (response.data.companyId) {
        queryClient.invalidateQueries({
          queryKey: contactKeys.byCompany(response.data.companyId)
        });
        queryClient.invalidateQueries({
          queryKey: contactKeys.primaryByCompany(response.data.companyId)
        });
      }
      if (response.message) toast.success(response.message);
    },
    onError: (error: any) => {
      console.error('Set primary contact error:', error);
    },
  });

  return {
    createContact: async (data: CreateContactInput) => {
      const response = await createMutation.mutateAsync(data);
      return response.data;
    },
    updateContact: async (id: number, data: UpdateContactInput) => {
      const response = await updateMutation.mutateAsync({ id, data });
      return response.data;
    },
    deleteContact: async (id: number) => {
      await deleteMutation.mutateAsync(id);
    },
    toggleActive: async (id: number, active: boolean) => {
      const response = await toggleMutation.mutateAsync({ id, active });
      return response.data;
    },
    setPrimary: async (id: number) => {
      const response = await setPrimaryMutation.mutateAsync(id);
      return response.data;
    },
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleMutation.isPending,
  };
}

// ============================================================================
// HOOK: useContactExport
// ============================================================================

export function useContactExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportCSV = async (params?: ContactQueryParams) => {
    setIsExporting(true);
    try {
      const blob = await contactService.exportCSV(params);
      const filename = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Export CSV completato con successo');
    } catch (error: any) {
      console.error('Export CSV error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportExcel = async (params?: ContactQueryParams) => {
    setIsExporting(true);
    try {
      const blob = await contactService.exportExcel(params);
      const filename = `contacts_${new Date().toISOString().split('T')[0]}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Export Excel completato con successo');
    } catch (error: any) {
      console.error('Export Excel error:', error);
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
      console.error('Bulk activate error:', error);
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
      console.error('Bulk deactivate error:', error);
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
      console.error('Bulk delete error:', error);
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
    companyId: number,
    contactId?: number
  ): Promise<boolean> => {
    setIsValidating(true);
    try {
      return await contactService.checkEmailUnique(email, companyId, contactId);
    } catch (error) {
      console.error('Email validation error:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return { validateEmailUnique, isValidating };
}
