import { serverApi } from "@/lib/server/api";
import { USER_TAGS } from "@/types/user-types";
import {
  ChangePasswordInput,
  ConfirmTwoFactorInput,
  DisableTwoFactorInput,
  TwoFactorSetupResult,
  UpdateUserDetailsInput,
  UpdateUserProfileInput,
  UpsertUserSettingsInput,
  User,
  UserSetting,
  UserSettingKey,
  UserSettingValueMap,
} from "@mini-erp/shared";

/**
 * Get current user data
 * Con cache strategy
 */
export async function getUser(options?: { revalidate?: number | false }): Promise<User> {
  return serverApi.get<User>("/users/me", {
    revalidate: options?.revalidate ?? 60,
    tags: [USER_TAGS.profile],
  });
}

/**
 * Get current user data settings with Next.js cache tagging.
 */
export async function getUserSettings(options?: {
  revalidate?: number | false;
}): Promise<UserSetting[]> {
  return serverApi.get<UserSetting[]>("/users/me/settings", {
    revalidate: options?.revalidate ?? 60,
    tags: [USER_TAGS.settings],
  });
}

/**
 * Update current user profile
 * Invalida cache automaticamente
 */
export async function updateProfile(data: UpdateUserProfileInput): Promise<User> {
  return serverApi.put<User>("/users/me/profile", data, {
    tags: [USER_TAGS.profile],
    revalidate: false,
  });
}

/**
 * Update current user details
 */
export async function updateDetails(data: UpdateUserDetailsInput): Promise<User> {
  return serverApi.put<User>("/users/me/details", data, {
    tags: [USER_TAGS.profile],
    revalidate: false,
  });
}

/**
 * Change current user password
 */
export async function updatePassword(data: ChangePasswordInput): Promise<void> {
  await serverApi.put<void>("/users/me/change-password", data, {
    revalidate: false,
  });
}

/**
 * Initiates the 2FA setup flow. Returns the TOTP secret and QR code URI.
 */
export async function enableTwoFactor(): Promise<TwoFactorSetupResult> {
  return serverApi.post<TwoFactorSetupResult>("/users/me/2fa/enable");
}

/**
 * Disables 2FA for the current user.
 */
export async function disableTwoFactor(data: DisableTwoFactorInput): Promise<void> {
  return serverApi.post<void>("/users/me/2fa/disable", data);
}

/**
 * Confirms and activates 2FA with a TOTP code from the authenticator app.
 *
 * @param data - { totpCode }
 */
export async function confirmTwoFactor(data: ConfirmTwoFactorInput): Promise<void> {
  await serverApi.put<void>("/users/me/2fa/confirm", data, {
    revalidate: false,
  });
}

/**
 * Updates a single UserSetting key/value for the current user.
 *
 * @param key - A known UserSetting key (from USER_SETTING_KEYS)
 * @param value - The new string value for that key
 */
export async function updateSetting<K extends UserSettingKey>(
  key: K,
  value: UserSettingValueMap[K],
) {
  await serverApi.patch("/users/me/settings", { settings: [{ key, value }] });
}

/**
 * Bulk upserts multiple UserSettings in a single request.
 * Used by the preferences form on submit.
 *
 * @param data - Array of { key, value } pairs to upsert
 */
export async function upsertSettings(data: UpsertUserSettingsInput) {
  await serverApi.patch("/users/me/settings", data);
}
