// hooks/use-lead.ts
import { useQuery } from "@tanstack/react-query";
import { getLeads, getLeadById, getLeadStats } from "@/services/client/lead";
import type { LeadQueryInput, LeadStatsInput } from "@/types/lead";

// ============================================================================
// Query Keys
// ============================================================================

export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (params: LeadQueryInput) => [...leadKeys.lists(), params] as const,
  details: () => [...leadKeys.all, "detail"] as const,
  detail: (id: number) => [...leadKeys.details(), id] as const,
  stats: (params?: LeadStatsInput) => [...leadKeys.all, "stats", params] as const,
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook per la lista lead con filtri e paginazione
 */
export function useLeads(params: LeadQueryInput) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => getLeads(params),
  });
}

/**
 * Hook per una singola lead
 */
export function useLead(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: leadKeys.detail(id!),
    queryFn: () => getLeadById(id!),
    enabled: enabled && !!id,
  });
}

/**
 * Hook per le statistiche lead
 */
export function useLeadStats(params?: LeadStatsInput) {
  return useQuery({
    queryKey: leadKeys.stats(params),
    queryFn: () => getLeadStats(params),
  });
}
