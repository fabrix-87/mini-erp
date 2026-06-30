// packages/shared/src/validators/user-setting.ts
import { z } from "zod";
import { USER_SETTING_KEYS } from "../constants/user-settings";

const settingKeyValues = Object.values(USER_SETTING_KEYS) as [string, ...string[]];

/**
 * Schema for updating a single UserSetting key/value pair.
 */
export const updateUserSettingSchema = z.object({
  key: z.enum(settingKeyValues),
  value: z.string().min(1).max(255),
});

/**
 * Schema for bulk upsert of multiple settings (used by the preferences form submit).
 */
export const upsertUserSettingsSchema = z.object({
  settings: z.array(updateUserSettingSchema).min(1).max(50),
});
