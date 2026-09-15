import { OPPORTUNITY_TAGS } from "@/types/opportunity-types";
import { revalidateEntity, revalidateEntityWithList, revalidateTag } from ".";

export const opportunityRevalidation = {
  /** Revalidate single opportunity detail and path. */
  opportunity: (id: string) =>
    revalidateEntityWithList("opportunities", id, {
      detailTag: OPPORTUNITY_TAGS.detail(id),
      listTag: OPPORTUNITY_TAGS.list,
    }),

  /** Revalidate only the list. */
  list: () =>
    revalidateEntity("opportunities", undefined, {
      listTag: OPPORTUNITY_TAGS.list,
    }),

  /** Revalidate detail + list + stats. */
  opportunityWithList: (id: string) => {
    revalidateEntityWithList("opportunities", id, {
      detailTag: OPPORTUNITY_TAGS.detail(id),
      listTag: OPPORTUNITY_TAGS.list,
    });
    revalidateTag(OPPORTUNITY_TAGS.stats);
  },
};
