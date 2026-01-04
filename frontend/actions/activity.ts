// actions/activity.ts - Server Actions for mutations
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Activity } from "@/types/activitiy";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Get auth token from cookies
 */
async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action to create a new activity
 */
export async function createActivity(
  activityData: Partial<Activity>
): Promise<ActionResponse<Activity>> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/activities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(activityData),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || "Failed to create activity",
      };
    }

    const result = await response.json();
    
    // Revalidate the activities page to show the new activity
    revalidatePath("/activities");
    revalidatePath("/dashboard/activities");

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Error creating activity:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server Action to update an existing activity
 */
export async function updateActivity(
  id: number,
  activityData: Partial<Activity>
): Promise<ActionResponse<Activity>> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(activityData),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || "Failed to update activity",
      };
    }

    const result = await response.json();
    
    // Revalidate relevant paths
    revalidatePath("/activities");
    revalidatePath("/dashboard/activities");
    revalidatePath(`/activities/${id}`);
    revalidatePath(`/dashboard/activities/${id}`);

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Error updating activity:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server Action to delete an activity
 */
export async function deleteActivity(
  id: number
): Promise<ActionResponse> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || "Failed to delete activity",
      };
    }

    // Revalidate the activities page
    revalidatePath("/activities");
    revalidatePath("/dashboard/activities");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting activity:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server Action to update activity status
 */
export async function updateActivityStatus(
  id: number,
  status: "planned" | "in_progress" | "completed" | "cancelled"
): Promise<ActionResponse<Activity>> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/activities/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || "Failed to update activity status",
      };
    }

    const result = await response.json();
    
    // Revalidate relevant paths
    revalidatePath("/activities");
    revalidatePath("/dashboard/activities");
    revalidatePath(`/activities/${id}`);
    revalidatePath(`/dashboard/activities/${id}`);

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Error updating activity status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server Action to bulk update activities
 */
export async function bulkUpdateActivities(
  ids: number[],
  updateData: Partial<Activity>
): Promise<ActionResponse> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/activities/bulk-update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ ids, updateData }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || "Failed to bulk update activities",
      };
    }

    // Revalidate the activities page
    revalidatePath("/activities");
    revalidatePath("/dashboard/activities");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error bulk updating activities:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
