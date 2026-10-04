// actions/activity.ts - Server Actions for mutations
"use server";

import { serverApi } from "@/lib/server/api";
import { Activity } from "@/types/activitiy-types";
import { ApiResponse, DeleteApiResponse } from "@/types/api";
import { ServerApiError } from "@/types/server-client";
import {
  activityRevalidation,
  leadRevalidation,
  opportunityRevalidation,
} from "@/lib/server/revalidate";
import {
  ActivityOutcome,
  ActivityStatus,
  CompleteActivityFormValues,
  CreateActivityFormValues,
  UpdateActivityInput,
} from "@mini-erp/shared";
import {
  completeActivity,
  createActivity,
  deleteActivity,
  updateActivity,
  updateActivityStatus,
} from "@/services/server/activity-service";
import { ActionResult, withAuth } from "@/lib/server/action";

/**
 * Server Action — Create activity (generic)
 */
export async function createActivityAction(
  activityData: CreateActivityFormValues,
): Promise<ActionResult<Activity>> {
  return withAuth(async () => {
    const response = await createActivity({
      ...activityData,
      reminderMinutes: activityData.reminderMinutes
        ? Number(activityData.reminderMinutes)
        : undefined,
    });

    activityRevalidation.list();
    if (activityData.leadId) {
      activityRevalidation.forLead(activityData.leadId);
      leadRevalidation.lead(activityData.leadId);
    }
    if (activityData.opportunityId) {
      opportunityRevalidation.opportunity(activityData.opportunityId);
    }

    return response.data;
  }, "activity:create");
}

/**
 * Server Action to update an existing activity
 */
export async function updateActivityAction(
  id: string,
  activityData: UpdateActivityInput,
): Promise<ActionResult<Activity>> {
  return withAuth(async () => {
    const response = await updateActivity(id, activityData);

    // Revalidate relevant paths
    activityRevalidation.activityWithList(id);

    return response.data;
  }, "activity:update");
}

/**
 * Server Action to delete an activity
 */
export async function deleteActivityAction(id: string): Promise<ActionResult<DeleteApiResponse>> {
  return withAuth(async () => {
    const response = await deleteActivity(id);

    // Revalidate the activities page
    activityRevalidation.list();

    return response;
  }, "activity:delete");
}

/**
 * Server Action to update activity status
 */
export async function updateActivityStatusAction(
  id: string,
  status: ActivityStatus,
): Promise<ActionResult<Activity>> {
  return withAuth(async () => {
    const result = await updateActivityStatus(id, status);

    // Revalidate relevant paths
    activityRevalidation.activityWithList(id);

    return result.data;
  }, "activity:update");
}

/**
 * Server Action to bulk update activities
 */
export async function bulkUpdateActivities(
  ids: string[],
  updateData: Partial<Activity>,
): Promise<ActionResult> {
  try {
    await serverApi.patch("/activities/bulk-update", {
      ids,
      updateData,
    });

    // Revalidate the activities page
    activityRevalidation.list();

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error bulk updating activities:", error);

    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: error.message,
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
export async function completeActivityAction(
  id: string,
  data: CompleteActivityFormValues,
): Promise<ActionResult<Activity>> {
  return withAuth(async () => {
    const response = await completeActivity(id, data);

    // Revalidate relevant paths
    activityRevalidation.activityWithList(id);

    return response.data;
  }, "activity:update");
}
