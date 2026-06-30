// packages/frontend/app/(protected)/settings/profile/preferences/page.tsx
import { requireAuth } from "@/lib/server/auth";

import type { UserSetting } from "@mini-erp/shared/types";
import {
  USER_SETTING_DEFAULTS,
  USER_SETTING_KEYS,
  type UserSettingValueMap,
} from "@mini-erp/shared/constants";
import { PreferencesForm } from "../components/preferences-form";
import { getUserSettings } from "@/services/server/user-settings-service";

/**
 * Preferences tab — renders the user settings form.
 * Merges persisted settings with defaults before passing to the client component.
 */
export default async function PreferencesPage() {
  await requireAuth();

  const raw = await getUserSettings();

  // Merge persisted values over defaults
  const resolved = { ...USER_SETTING_DEFAULTS } as UserSettingValueMap;
  for (const s of raw) {
    if (s.key in resolved) {
      (resolved as Record<string, string>)[s.key] = s.value;
    }
  }

  return <PreferencesForm settings={resolved} />;
}
