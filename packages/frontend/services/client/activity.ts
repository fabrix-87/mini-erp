// services/client/activity.ts - Client-side service functions
"use client";

import api from "@/lib/client/api";
import { 
  Activity, 
  ActivityDashboardStats, 
  ActivityStats, 
  ActivityStatsParams, 
  getActivitiesParams 
} from "@/types/activitiy";
import { ApiResponse } from "@/types/api";

/**
 * Recupera le statistiche delle attività
 */
export const getActivityStats = async (
  params?: ActivityStatsParams
): Promise<ApiResponse<ActivityStats>> => {
  const response = await api.get("/activities/stats", { params });
  return response.data;
};

/**
 * Client-side function to fetch activities with filters
 * Used for dynamic filtering and search on the client
 */
export async function getActivities(
  params: getActivitiesParams
): Promise<ApiResponse<Activity[]>> {
  const response = await api.get<ApiResponse<Activity[]>>("/activities", {
    params,
  });
  return response.data;
}

/**
 * Client-side function to fetch activity statistics
 */
export async function fetchActivityStatsClient(
  userId: number
): Promise<ApiResponse<ActivityDashboardStats>> {
  const response = await api.get<ApiResponse<ActivityDashboardStats>>(
    `/activities/stats`,
    {
      params: { userId },
    }
  );
  return response.data;
}

/**
 * Client-side function to fetch a single activity
 */
export async function getActivityById(
  id: number
): Promise<ApiResponse<Activity>> {
  const response = await api.get<ApiResponse<Activity>>(`/activities/${id}`);
  return response.data;
}
