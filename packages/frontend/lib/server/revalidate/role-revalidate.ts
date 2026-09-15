import { ROLE_TAGS } from "@/types/role-types";
import { revalidateEntity, revalidateEntityWithList } from ".";

/**
 * Revalidate role-related cache.
 * Route: /admin/roles
 */
export const roleRevalidation = {
  /** Revalidate specific role detail and roles list. */
  role: (id: number) =>
    revalidateEntityWithList("roles", id, {
      detailTag: ROLE_TAGS.detail(id),
      listTag: ROLE_TAGS.list,
    }),

  /** Revalidate roles list only. */
  list: () => revalidateEntity("roles", undefined, { listTag: ROLE_TAGS.list }),
};
