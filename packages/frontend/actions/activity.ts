// actions/activity.ts - Server Actions for mutations
"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/server/api";
import { Activity, ActivityFormData } from "@/types/activitiy";
import { ApiResponse } from "@/types/api";
import { ServerApiError } from "@/types/server-client";
import { activityRevalidation } from "@/lib/server/revalidate";
import { UpdateActivityInput } from "@mini-erp/shared";

interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

/**
 * Server Action — Create activity (generic)
 */
export async function createActivity(
  activityData: Partial<Activity> | ActivityFormData,
): Promise<ActionResponse<Activity>> {
  try {
    const response = await serverApi.post<ApiResponse<Activity>>("/activities", activityData, {
      unwrapData: false,
    });

    activityRevalidation.list();
    if (activityData.leadId) {
      activityRevalidation.forLead(Number(activityData.leadId));
    }

    return { success: true, data: response.data };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return { success: false, error: error.message, errors: error.details };
    }
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Server Action — Create activity linked to a lead.
 * Revalidates both the activities list and the lead detail page.
 */
export async function createLeadActivity(
  leadId: number,
  activityData: Partial<Activity> | ActivityFormData,
): Promise<ActionResponse<Activity>> {
  try {
    const response = await serverApi.post<ApiResponse<Activity>>(
      "/activities",
      { ...activityData, leadId },
      { unwrapData: false },
    );

    activityRevalidation.list();
    activityRevalidation.forLead(leadId);

    return { success: true, data: response.data };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return { success: false, error: error.message, errors: error.details };
    }
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Server Action to update an existing activity
 */
export async function updateActivity(
  id: number,
  activityData: UpdateActivityInput,
): Promise<ActionResponse<Activity>> {
  try {
    const response = await serverApi.put<ApiResponse<Activity>>(`/activities/${id}`, activityData, {
      unwrapData: false,
    });

    // Revalidate relevant paths
    revalidatePath("/activities");
    revalidatePath("/dashboard/activities");
    revalidatePath(`/activities/${id}`);
    revalidatePath(`/dashboard/activities/${id}`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error updating activity:", error);

    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: error.message,
        errors: error.details,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server Action to delete an activity
 */
export async function deleteActivity(id: number): Promise<ActionResponse> {
  try {
    await serverApi.delete(`/activities/${id}`);

    // Revalidate the activities page
    revalidatePath("/activities");
    revalidatePath("/dashboard/activities");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting activity:", error);

    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: error.message,
        errors: error.details,
      };
    }

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
  status: Activity["status"],
): Promise<ActionResponse<Activity>> {
  try {
    const response = await serverApi.patch<ApiResponse<Activity>>(
      `/activities/${id}/status`,
      { status },
      { unwrapData: false },
    );

    // Revalidate relevant paths
    revalidatePath("/activities");
    revalidatePath("/dashboard/activities");
    revalidatePath(`/activities/${id}`);
    revalidatePath(`/dashboard/activities/${id}`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error updating activity status:", error);

    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: error.message,
        errors: error.details,
      };
    }

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
  updateData: Partial<Activity>,
): Promise<ActionResponse> {
  try {
    await serverApi.patch("/activities/bulk-update", {
      ids,
      updateData,
    });

    // Revalidate the activities page
    revalidatePath("/activities");
    revalidatePath("/dashboard/activities");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error bulk updating activities:", error);

    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: error.message,
        errors: error.details,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server Action to update activity completion
 */
export async function completeActivity(
  id: number,
  outcome?: string,
  outcomeNotes?: string,
): Promise<ActionResponse<Activity>> {
  try {
    const response = await serverApi.patch<ApiResponse<Activity>>(
      `/activities/${id}`,
      {
        status: "completed" as Activity["status"],
        completedDate: new Date().toISOString(),
        outcome,
        outcomeNotes,
      },
      { unwrapData: false },
    );

    // Revalidate relevant paths
    revalidatePath("/activities");
    revalidatePath("/dashboard/activities");
    revalidatePath(`/activities/${id}`);
    revalidatePath(`/dashboard/activities/${id}`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error completing activity:", error);

    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: error.message,
        errors: error.details,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
