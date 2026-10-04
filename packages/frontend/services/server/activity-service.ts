// services/server/activity-service.ts - Server-side service functions (SSR)
import { serverApi } from "@/lib/server/api";
import {
  Activity,
  ACTIVITY_TAGS,
  ActivityQueryInput,
  ActivitySingleApiResponse,
} from "@/types/activitiy-types";
import { ApiResponse, DeleteApiResponse } from "@/types/api";
import {
  ActivityStats,
  ActivityStatus,
  CompleteActivityFormValues,
  CreateActivityFormValues,
  PaginatedResponse,
  UpdateActivityInput,
} from "@mini-erp/shared";

/**
 * Server-side function to fetch activities (for SSR)
 * This runs on the server and uses serverApi with automatic cookie handling
 */
export async function fetchActivitiesServer(
  params: ActivityQueryInput,
  revalidate: number | false = 0, // No cache per dati sempre freschi
): Promise<PaginatedResponse<Activity>> {
  try {
    // unwrapData: false per ottenere l'intera risposta con pagination
    const response = await serverApi.get<PaginatedResponse<Activity>>("/activities", {
      params,
      unwrapData: false, // Otteniamo { status, data, pagination }
      revalidate: revalidate,
      // Alternative per cache: revalidate: 60 per ISR
    });
    return response;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}

/**
 * Server-side function to fetch activity statistics (for SSR)
 */
export async function fetchActivityStatsServer(
  userId?: string,
): Promise<ApiResponse<ActivityStats>> {
  try {
    const response = await serverApi.get<ApiResponse<ActivityStats>>("/activities/stats", {
      params: { userId },
      unwrapData: false,
      revalidate: 300, // Cache per 5 minuti
    });
    return response;
  } catch (error) {
    console.error("Error fetching activity stats:", error);
    throw error;
  }
}

/**
 * Server-side function to fetch a single activity (for SSR)
 */
export async function fetchActivityByIdServer(
  id: string,
  revalidate: number | false = 0,
): Promise<Activity> {
  const activity = await serverApi.get<Activity>(`/activities/${id}`, {
    revalidate: revalidate,
    tags: [ACTIVITY_TAGS.detail(id), ACTIVITY_TAGS.list],
  });
  return activity;
}

/**
 * Create a new activity.
 */
export async function createActivity(
  data: CreateActivityFormValues,
): Promise<ActivitySingleApiResponse> {
  return serverApi.post<ActivitySingleApiResponse>("/activities", data, {
    tags: [ACTIVITY_TAGS.list],
    unwrapData: false,
  });
}

/**
 * Update an existing activity.
 */
export async function updateActivity(
  id: string,
  data: UpdateActivityInput,
): Promise<ActivitySingleApiResponse> {
  return serverApi.put<ActivitySingleApiResponse>(`/activities/${id}`, data, {
    tags: [ACTIVITY_TAGS.detail(id)],
    unwrapData: false,
  });
}

/**
 * Delete activity.
 */
export async function deleteActivity(id: string): Promise<DeleteApiResponse> {
  return serverApi.delete(`/activities/${id}`, {
    tags: [ACTIVITY_TAGS.detail(id), ACTIVITY_TAGS.list],
  });
}

/**
 * Updates only the staus.
 * @param id - Activity ID
 * @param status - New Status
 * @return ActivitySingleApiResponse
 */
export async function updateActivityStatus(
  id: string,
  status: ActivityStatus,
): Promise<ActivitySingleApiResponse> {
  return serverApi.patch(
    `/activities/${id}/status`,
    { status },
    { unwrapData: false, tags: [ACTIVITY_TAGS.detail(id), ACTIVITY_TAGS.list] },
  );
}

/**
 * Set the activity complete.
 * @param id - Activity ID
 * @param data - Complete Activity Data
 * @return ActivitySingleApiResponse
 */
export async function completeActivity(
  id: string,
  data: CompleteActivityFormValues,
): Promise<ActivitySingleApiResponse> {
  return serverApi.patch(`/activities/${id}/complete`, data, {
    unwrapData: false,
    tags: [ACTIVITY_TAGS.detail(id), ACTIVITY_TAGS.list],
  });
}
