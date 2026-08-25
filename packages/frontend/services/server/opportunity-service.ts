"use server";

import { serverApi } from "@/lib/server/api";
import {
  type OpportunityListApiResponse,
  type OpportunityStatsApiResponse,
  type OpportunityQueryInput,
  OPPORTUNITY_TAGS,
} from "@/types/opportunity-types";
import type {
  OpportunityComplete,
  CreateOpportunityInput,
  UpdateOpportunityInput,
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
