// services/server/activity.ts - Server-side service functions (SSR)
import { Activity, ActivityDashboardStats, getActivitiesParams } from "@/types/activitiy";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface ApiResponse<T> {
  data: T;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

/**
 * Get auth token from cookies
 */
async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

/**
 * Server-side function to fetch activities (for SSR)
 * This runs on the server and can access cookies directly
 */
export async function fetchActivitiesServer(
  params: getActivitiesParams
): Promise<ApiResponse<Activity[]>> {
  const token = await getAuthToken();
  
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/activities?${queryParams}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    // Use 'no-store' to ensure fresh data or configure revalidation as needed
    cache: "no-store",
    // Alternative: next: { revalidate: 60 } for ISR
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Failed to fetch activities"
    }));
    throw new Error(error.message || "Failed to fetch activities");
  }

  return response.json();
}

/**
 * Server-side function to fetch activity statistics (for SSR)
 */
export async function fetchActivityStatsServer(
  userId: number
): Promise<ApiResponse<ActivityDashboardStats>> {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/activities/stats?userId=${userId}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: "no-store",
    // Alternative: next: { revalidate: 300 } for 5-minute cache
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Failed to fetch activity stats"
    }));
    throw new Error(error.message || "Failed to fetch activity stats");
  }

  return response.json();
}

/**
 * Server-side function to fetch a single activity (for SSR)
 */
export async function fetchActivityByIdServer(
  id: number
): Promise<ApiResponse<Activity>> {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Failed to fetch activity"
    }));
    throw new Error(error.message || "Failed to fetch activity");
  }

  return response.json();
}

/**
 * Server-side function to fetch initial data for the activities page
 * Combines multiple data fetches for initial page load
 */
export async function fetchActivitiesPageData(params: getActivitiesParams, userId: number) {
  try {
    const [activitiesResponse, statsResponse] = await Promise.all([
      fetchActivitiesServer(params),
      fetchActivityStatsServer(userId),
    ]);

    return {
      activities: activitiesResponse.data,
      pagination: activitiesResponse.pagination,
      stats: statsResponse.data,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching activities page data:", error);
    return {
      activities: [],
      pagination: undefined,
      stats: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
