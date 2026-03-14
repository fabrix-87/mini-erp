"use client";

import { clientRoleService } from "@/services/client/role";
import {
  defaultParams,
  RoleFilters,
  roleKeys,
  UseRoleMutationsReturn,
  UseRoleReturn,
  UseRolesReturn,
} from "@/types/role";
import {
  CreateRoleInput,
  RoleQueryInput,
  UpdateRoleInput,
} from "@mini-erp/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ============================================================================
// HOOK: useRoles (Lista con filtri e paginazione)
// ============================================================================
export function useRoles(params: RoleQueryInput = defaultParams): UseRolesReturn {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => clientRoleService.getAll(params),
    staleTime: 5 * 60 * 1000,
  });

  const filters: RoleFilters = {
    search: params.search,
    isDefault: params.isDefault,
    sortOrder: params.sortOrder,
    sortBy: params.sortBy,
  };

  return {
    roles: response?.data || [],
    loading: isLoading,
    error: error?.message || null,
    pagination: response?.pagination || null,
    filters,
    refetch: async () => {
      await refetch();
    },
    sort: {
      field: params.sortBy || "code",
      order: params.sortOrder || "asc",
    },
  };
}

// ============================================================================
// HOOK: useRole (Singolo ruolo)
// ============================================================================
export function useRole(id: number): UseRoleReturn {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => clientRoleService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    role: response?.data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
  };
}

// ============================================================================
// HOOK: useRoleMutations (CRUD Operations)
// ============================================================================

export function useRoleMutations(): UseRoleMutationsReturn {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateRoleInput) => clientRoleService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      if (response.message) toast.success(response.message);
    },
    onError: (error: any) => {
      console.error("Create role error:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleInput }) =>
      clientRoleService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(response.data.id) });
      if (response.message) toast.success(response.message);
    },
    onError: (error: any) => {
      console.error("Update role error:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientRoleService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      if (response.message) toast.success(response.message);
    },
    onError: (error: any) => {
      console.error("Delete role error:", error);
    },
  });

  return {
    createRole: async (data: CreateRoleInput) => {
      const response = await createMutation.mutateAsync(data);
      return response.data;
    },
    updateRole: async (id: number, data: UpdateRoleInput) => {
      const response = await updateMutation.mutateAsync({ id, data });
      return response.data;
    },
    deleteRole: async (id: number) => {
      await deleteMutation.mutateAsync(id);
    },
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
