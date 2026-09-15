import { USER_TAGS } from "@/types/user-types";
import { revalidateEntity, revalidateEntityWithList, revalidateTag } from ".";

/**
 * Revalidate user-related cache.
 * Route: /admin/users
 */
export const userRevalidation = {
  /** Revalidate specific user detail and path. */
  user: (id: string) => revalidateEntity("users", id, { detailTag: USER_TAGS.detail(id) }),

  /** Revalidate users list. */
  list: () => revalidateEntity("users", undefined, { listTag: USER_TAGS.list }),

  /** Revalidate specific user and users list. */
  userWithList: (id: string) => revalidateEntityWithList("users", id, { 
    detailTag: USER_TAGS.detail(id),
    listTag: USER_TAGS.list
   }),

  /** Revalidate user profile tag only (no path needed). */
  profile: () => revalidateTag("user-profile"),
};

/**
 * Revalidate settings-related cache for the current user.
 * Route: /settings/profile
 */
export const settingsRevalidation = {
  /** Revalidate user profile tag (shared with userRevalidation). */
  profile: () => revalidateTag("user-profile"),

  /** Revalidate user settings tag. */
  settings: () => revalidateTag("user-settings"),

  /** Revalidate both profile and settings. */
  all: () => {
    revalidateTag("user-profile");
    revalidateTag("user-settings");
  },
};

