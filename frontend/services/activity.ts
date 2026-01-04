// services/activity.ts - Client-side service functions
"use client";

import { Activity, ActivityDashboardStats, getActivitiesParams } from "@/types/activitiy";

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
 * Client-side function to fetch activities with filters
 * Used for dynamic filtering and search on the client
 */
export async function fetchActivitiesClient(
  params: getActivitiesParams,
  token?: string
): Promise<ApiResponse<Activity[]>> {
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
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch activities");
  }

  return response.json();
}

/**
 * Client-side function to fetch activity statistics
 */
export async function fetchActivityStatsClient(
  userId: number,
  token?: string
): Promise<ApiResponse<ActivityDashboardStats>> {
  const response = await fetch(`${API_BASE_URL}/activities/stats?userId=${userId}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch activity stats");
  }

  return response.json();
}

/**
 * Client-side function to fetch a single activity
 */
export async function fetchActivityByIdClient(
  id: number,
  token?: string
): Promise<ApiResponse<Activity>> {
  const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch activity");
  }

  return response.json();
}
