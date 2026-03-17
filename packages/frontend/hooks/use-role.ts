"use client";

import { clientPermissionService, clientRoleService } from "@/services/client/role";
import {
  defaultParams,
  defaultPermissionParams,
  permissionKeys,
  RoleFilters,
  roleKeys,
  UsePermissionMutationsReturn,
  UsePermissionsReturn,
  UseRoleMutationsReturn,
  UseRoleReturn,
  UseRolesReturn,
} from "@/types/role";
import {
  AssignPermissionsInput,
  CreatePermissionInput,
  CreateRoleInput,
  PermissionQueryInput,
  RoleQueryInput,
  UpdatePermissionInput,
  UpdateRoleInput,
} from "@mini-erp/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ============================================================================
// HOOK: useRoles
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
// HOOK: useRole
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
    enabled: !!id && id > 0,
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
// HOOK: useRoleMutations
// ============================================================================

export function useRoleMutations(): UseRoleMutationsReturn {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateRoleInput) => clientRoleService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      if (response.message) toast.success(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Errore durante la creazione del ruolo");
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
    onError: (error: Error) => {
      toast.error(error.message || "Errore durante l'aggiornamento del ruolo");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientRoleService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      if (response.message) toast.success(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Errore durante l'eliminazione del ruolo");
    },
  });

  return {
    createRole: async (data) => {
      const response = await createMutation.mutateAsync(data);
      return response.data;
    },
    updateRole: async (id, data) => {
      const response = await updateMutation.mutateAsync({ id, data });
      return response.data;
    },
    deleteRole: async (id) => {
      await deleteMutation.mutateAsync(id);
    },
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// ============================================================================
// HOOK: usePermissions
// ============================================================================

export function usePermissions(params?: PermissionQueryInput): UsePermissionsReturn {
  const queryParams = params ?? defaultPermissionParams;

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: permissionKeys.list(queryParams),
    queryFn: () => clientPermissionService.getAll(queryParams),
    staleTime: 10 * 60 * 1000,
  });

  return {
    permissions: response?.data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
  };
}

// ============================================================================
// HOOK: usePermissionMutations
// ============================================================================

export function usePermissionMutations(): UsePermissionMutationsReturn {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreatePermissionInput) => clientPermissionService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      if (response.message) toast.success(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Errore durante la creazione del permesso");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePermissionInput }) =>
      clientPermissionService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: permissionKeys.detail(response.data.id),
      });
      if (response.message) toast.success(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Errore durante l'aggiornamento del permesso");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientPermissionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all });
      toast.success("Permesso eliminato con successo");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Errore durante l'eliminazione del permesso");
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ roleId, data }: { roleId: number; data: AssignPermissionsInput }) =>
      clientRoleService.assignPermissions(roleId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(response.data.id) });
      queryClient.invalidateQueries({
        queryKey: roleKeys.permissions(response.data.id),
      });
      if (response.message) toast.success(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Errore durante l'assegnazione dei permessi");
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ roleId, data }: { roleId: number; data: AssignPermissionsInput }) =>
      clientRoleService.removePermissions(roleId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(response.data.id) });
      queryClient.invalidateQueries({
        queryKey: roleKeys.permissions(response.data.id),
      });
      if (response.message) toast.success(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Errore durante la rimozione dei permessi");
    },
  });

  return {
    createPermission: async (data) => {
      const response = await createMutation.mutateAsync(data);
      return response.data;
    },
    updatePermission: async (id, data) => {
      const response = await updateMutation.mutateAsync({ id, data });
      return response.data;
    },
    deletePermission: async (id) => {
      await deleteMutation.mutateAsync(id);
    },
    assignPermissionsToRole: async (roleId, data) => {
      const response = await assignMutation.mutateAsync({ roleId, data });
      return response.data;
    },
    removePermissionsFromRole: async (roleId, data) => {
      const response = await removeMutation.mutateAsync({ roleId, data });
      return response.data;
    },
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAssigning: assignMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
