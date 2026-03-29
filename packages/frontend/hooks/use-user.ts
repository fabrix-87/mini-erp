// hooks/use-user.ts
"use client";

import { clientUserService } from "@/services/client/user";
import { UserQueryInput } from "@mini-erp/shared";
import { useQuery } from "@tanstack/react-query";

// ============================================================================
// Query Keys
// ============================================================================

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: UserQueryInput) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, "stats"] as const,
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook per la lista users con filtri e paginazione
 */
export function useUsers(params: UserQueryInput) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => clientUserService.getAll(params),
  });
}

/**
 * Hook per una singolo user
 */
export function useUser(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(id!),
    queryFn: () => clientUserService.getUserById(id!),
    enabled: enabled && !!id,
  });
}

/**
 * Hook per le statistiche users
 */
export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => clientUserService.getStats(),
  });
}
