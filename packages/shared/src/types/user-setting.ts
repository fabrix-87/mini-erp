// packages/shared/src/types/user-setting.ts
import type { UserSettingKey, UserSettingValueMap } from "../constants/user-settings";
import type { updateUserSettingSchema, upsertUserSettingsSchema } from "../validators/user-setting";
import type { z } from "zod";

/**
 * Single UserSetting entity as returned by the API.
 * Mirrors the Prisma `UserSetting` model (key/value store).
 */
export type UserSetting = {
  id: number;
  userId: string;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Resolved map of settings for a user, with typed values and defaults applied.
 * Use this type in components and server-side data fetching.
 */
export type ResolvedUserSettings = UserSettingValueMap;

/**
 * Typed helper to retrieve a single setting value with inferred return type.
 * @param settings - The resolved settings map for the current user.
 * @param key - A known UserSetting key.
 * @returns The typed value for that key.
 */
export function getUserSetting<K extends UserSettingKey>(
  settings: ResolvedUserSettings,
  key: K,
): UserSettingValueMap[K] {
  return settings[key];
}

// --- Input types inferred from validators ---
export type UpdateUserSettingInput = z.infer<typeof updateUserSettingSchema>;
export type UpsertUserSettingsInput = z.infer<typeof upsertUserSettingsSchema>;
