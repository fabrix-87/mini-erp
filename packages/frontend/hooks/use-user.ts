// hooks/use-user.ts
"use client";

import { clientUserService } from "@/services/client/user";
import { userKeys } from "@/types/user-types";
import { UserQueryInput } from "@mini-erp/shared";
import { useQuery } from "@tanstack/react-query";

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
export function useUser(id: string | undefined, enabled = true) {
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
