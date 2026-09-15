import { ACTIVITY_TAGS } from "@/types/activitiy-types";
import { revalidateEntity, revalidateEntityWithList, revalidatePath, revalidateTag } from ".";
import { getRoute } from "@/lib/navigation-routes";

/**
 * Revalidate activity-related cache.
 * Route: /activities
 */
export const activityRevalidation = {
  /** Revalidate specific activity detail and activities list. */
  activity: (id: string) =>
    revalidateEntityWithList("activities", id, {
      detailTag: ACTIVITY_TAGS.detail(id),
      listTag: ACTIVITY_TAGS.list,
    }),

  /** Revalidate activities list. */
  list: () =>
    revalidateEntity("activities", undefined, {
      listTag: ACTIVITY_TAGS.list,
    }),

  /** Revalidate detail + list + stats. */
  activityWithList: (id: string) => {
    revalidateEntityWithList("activities", id, {
      detailTag: ACTIVITY_TAGS.detail(id),
      listTag: ACTIVITY_TAGS.list,
    });
    revalidateTag(ACTIVITY_TAGS.stats);
  },

  /**
   * Revalidate activities belonging to a specific lead.
   * Invalidates the lead detail page and the activities-lead tag.
   */
  forLead: (leadId: string) => {
    revalidateTag(`activities-lead-${leadId}`);
    revalidatePath(`${getRoute('leads')}/${leadId}`, "page");
  },
};
