import { CONTACT_TAGS } from "@/types/contact-types";
import { revalidateEntity, revalidateEntityWithList } from ".";

/**
 * Revalidate contact-related cache.
 * Route: /crm/contacts
 */
export const contactRevalidation = {
  /** Revalidate specific contact detail and path. */
  contact: (id: string) =>
    revalidateEntity("contacts", id, {
      detailTag: CONTACT_TAGS.detail(id),
    }),

  /** Revalidate contacts list. */
  list: () =>
    revalidateEntity("contacts", undefined, {
      listTag: CONTACT_TAGS.list,
    }),

  /** Revalidate specific contact and contacts list. */
  contactWithList: (id: string) =>
    revalidateEntityWithList("contacts", id, {
      detailTag: CONTACT_TAGS.detail(id),
      listTag: CONTACT_TAGS.list,
    }),
};
