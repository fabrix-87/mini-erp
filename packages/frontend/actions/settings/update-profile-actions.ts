'use server';

import { withSelf } from '@/lib/server/action';
import { settingsRevalidation } from '@/lib/server/revalidate/entities';
import { updateProfile } from '@/services/server/user-settings-service';
import type { ProfileFormValues } from '@mini-erp/shared/types';

/**
 * Updates the current user's profile details (UserDetails + username).
 * Only requires an authenticated session — no admin permission needed.
 *
 * @param data - Combined profile + details payload
 */
export async function updateProfileAction(
  data: ProfileFormValues,
) {
  return withSelf(async () => {
    await updateProfile(data)
    settingsRevalidation.profile();
  });
}