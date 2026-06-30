"use server";

import { withSelf } from "@/lib/server/action";
import { settingsRevalidation } from "@/lib/server/revalidate/entities";
import { updateSetting, upsertSettings } from "@/services/server/user-settings-service";
import type {
  UserSettingKey,
  UserSettingValueMap,
  UpsertUserSettingsInput,
} from "@mini-erp/shared";

/**
 * Updates a single UserSetting key/value for the current user.
 *
 * @param key - A known UserSetting key (from USER_SETTING_KEYS)
 * @param value - The new string value for that key
 */
export async function updateSettingAction<K extends UserSettingKey>(
  key: K,
  value: UserSettingValueMap[K],
) {
  return withSelf(async () => {
    await updateSetting(key, value);
    settingsRevalidation.settings();
  });
}

/**
 * Bulk upserts multiple UserSettings in a single request.
 * Used by the preferences form on submit.
 *
 * @param data - Array of { key, value } pairs to upsert
 */
export async function upsertSettingsAction(data: UpsertUserSettingsInput) {
  return withSelf(async () => {
    await upsertSettings(data);
    settingsRevalidation.settings();
  });
}
