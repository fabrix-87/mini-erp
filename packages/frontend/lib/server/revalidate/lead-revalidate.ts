import { LEAD_TAGS } from "@/types/lead-types";
import { revalidateEntity, revalidateEntityWithList } from ".";

/**
 * Revalidate lead-related cache.
 * Route: /crm/leads
 */
export const leadRevalidation = {
  /** Revalidate specific lead detail and leads list. */
  lead: (id: string) =>
    revalidateEntityWithList("leads", id, {
      detailTag: LEAD_TAGS.detail(id),
      listTag: LEAD_TAGS.list,
    }),

  /** Revalidate leads list. */
  list: () => revalidateEntity("leads", undefined, { listTag: LEAD_TAGS.list }),
};
