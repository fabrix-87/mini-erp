// services/server/activity.ts - Server-side service functions (SSR)
import { serverApi } from "@/lib/server/api";
import { 
  Activity, 
  ActivityDashboardStats,
  ActivityQueryInput, 
} from "@/types/activitiy";
import { ApiResponse } from "@/types/api";
import { getUserFromCookiesSSR } from "@/lib/server/cookies";

/**
 * Server-side function to fetch activities (for SSR)
 * This runs on the server and uses serverApi with automatic cookie handling
 */
export async function fetchActivitiesServer(
  params: ActivityQueryInput
): Promise<ApiResponse<Activity[]>> {
  try {
    // unwrapData: false per ottenere l'intera risposta con pagination
    const response = await serverApi.get<ApiResponse<Activity[]>>(
      "/activities",
      {
        params,
        unwrapData: false, // Otteniamo { status, data, pagination }
        revalidate: 0, // No cache per dati sempre freschi
        // Alternative per cache: revalidate: 60 per ISR
      }
    );
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
  userId: string
): Promise<ApiResponse<ActivityDashboardStats>> {
  try {
    const response = await serverApi.get<ApiResponse<ActivityDashboardStats>>(
      "/activities/stats",
      {
        params: { userId },
        unwrapData: false,
        revalidate: 300, // Cache per 5 minuti
      }
    );
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
  id: number
): Promise<Activity> {
  try {
    // unwrapData: true (default) per ottenere direttamente i dati
    const activity = await serverApi.get<Activity>(`/activities/${id}`, {
      revalidate: 0,
    });
    return activity;
  } catch (error) {
    console.error("Error fetching activity:", error);
    throw error;
  }
}

/**
 * Server-side function to fetch initial data for the activities page
 * Combines multiple data fetches for initial page load
 * Gets userId from cookies automatically
 */
export async function fetchActivitiesPageData(
  params: ActivityQueryInput
) {
  try {
    // Get user from cookies server-side
    const user = await getUserFromCookiesSSR();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const [activitiesResponse, statsResponse] = await Promise.all([
      fetchActivitiesServer(params),
      fetchActivityStatsServer(user.id),
    ]);

    return {
      activities: activitiesResponse.data,
      pagination: activitiesResponse.pagination,
      stats: statsResponse.data,
      error: null,
    };
  } catch (error: any) {
    console.error("Error fetching activities page data:", error);
    return {
      activities: [] as Activity[],
      pagination: undefined,
      stats: null,
      error: error.message || "Unknown error",
    };
  }
}
