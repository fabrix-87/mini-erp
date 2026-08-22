// hooks/use-lead.ts
import { useQuery } from "@tanstack/react-query";
import { getLeads, getLeadById, getLeadStats } from "@/services/client/lead";
import { leadKeys, type LeadQueryInput, type LeadStatsInput } from "@/types/lead-types";

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
