"use server";

import { serverApi } from "@/lib/server/api";
import {
  type OpportunityListApiResponse,
  type OpportunityStatsApiResponse,
  type OpportunityQueryInput,
  OPPORTUNITY_TAGS,
  OpportunityPipelineApiResponse,
  OpportunitySalesFunnelMetricsApiResponse,
} from "@/types/opportunity-types";
import type {
  OpportunityComplete,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  OpportunityStatsInput,
  SalesFunnelAnalysisInput,
} from "@mini-erp/shared";

/**
 * Fetch paginated opportunity list.
 * @param params - Query filters and pagination
 * @param revalidate - Cache TTL in seconds (false = no cache)
 */
export async function getAllOpportunities(
  params: OpportunityQueryInput,
  revalidate?: number | false,
): Promise<OpportunityListApiResponse> {
  return serverApi.get<OpportunityListApiResponse>("/opportunities", {
    params,
    revalidate: revalidate ?? false,
    tags: [OPPORTUNITY_TAGS.list],
    unwrapData: false,
  });
}

/**
 * Fetch opportunity stats for the stats bar.
 * @param revalidate - Cache TTL in seconds
 */
export async function getOpportunityStatsServer(
  revalidate?: number | false,
): Promise<OpportunityStatsApiResponse> {
  return serverApi.get<OpportunityStatsApiResponse>("/opportunities/stats", {
    revalidate: revalidate ?? 300,
    tags: [OPPORTUNITY_TAGS.stats],
    unwrapData: false,
  });
}

/**
 * Fetch pipeline analysis stats (used in the list stats bar).
 * @param params - Optional filters (assignedUserId, customerId, dateFrom, dateTo, source)
 * @param revalidate - Cache TTL in seconds
 */
export async function getOpportunityPipelineStats(
  params?: Partial<OpportunityStatsInput>,
  revalidate?: number | false,
): Promise<OpportunityPipelineApiResponse> {
  return serverApi.get<OpportunityPipelineApiResponse>("/opportunities/stats/pipeline", {
    params,
    revalidate: revalidate ?? 300,
    tags: [OPPORTUNITY_TAGS.stats],
    unwrapData: false,
  });
}

/**
 * Fetch sales funnel metrics.
 * @param params - Funnel filters (assignedUserId, dateFrom, dateTo, groupBy)
 * @param revalidate - Cache TTL in seconds
 */
export async function getOpportunitySalesFunnel(
  params?: Partial<SalesFunnelAnalysisInput>,
  revalidate?: number | false,
): Promise<OpportunitySalesFunnelMetricsApiResponse> {
  return serverApi.get<OpportunitySalesFunnelMetricsApiResponse>("/opportunities/stats/funnel", {
    params,
    revalidate: revalidate ?? 300,
    tags: [OPPORTUNITY_TAGS.stats],
    unwrapData: false,
  });
}

/**
 * Fetch single opportunity by ID.
 * @param id - Opportunity ID
 */
export async function getOpportunityById(
  id: string,
  revalidate?: number | false,
): Promise<OpportunityComplete> {
  return serverApi.get<OpportunityComplete>(`/opportunities/${id}`, {
    revalidate: revalidate ?? false,
    tags: [OPPORTUNITY_TAGS.detail(id)],
  });
}

/**
 * Create a new opportunity.
 */
export async function createOpportunity(
  data: CreateOpportunityInput,
): Promise<OpportunityComplete> {
  return serverApi.post<OpportunityComplete>("/opportunities", data);
}

/**
 * Update an existing opportunity.
 */
export async function updateOpportunity(
  id: string,
  data: UpdateOpportunityInput,
): Promise<OpportunityComplete> {
  return serverApi.put<OpportunityComplete>(`/opportunities/${id}`, data);
}

/**
 * Delete an opportunity.
 */
export async function deleteOpportunity(id: string): Promise<void> {
  return serverApi.delete(`/opportunities/${id}`);
}
