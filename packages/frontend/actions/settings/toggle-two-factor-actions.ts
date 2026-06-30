"use server";

import { withSelf } from "@/lib/server/action";
import { settingsRevalidation } from "@/lib/server/revalidate/entities";
import {
  confirmTwoFactor,
  disableTwoFactor,
  enableTwoFactor,
} from "@/services/server/user-settings-service";
import type { ConfirmTwoFactorInput, DisableTwoFactorInput } from "@mini-erp/shared/types";

/**
 * Initiates the 2FA setup flow. Returns the TOTP secret and QR code URI.
 */
export async function enableTwoFactorAction() {
  return withSelf(async () => {
    return enableTwoFactor();
  });
}

/**
 * Confirms and activates 2FA with a TOTP code from the authenticator app.
 *
 * @param data - { totpCode }
 */
export async function confirmTwoFactorAction(data: ConfirmTwoFactorInput) {
  return withSelf(async () => {
    await confirmTwoFactor(data);
    settingsRevalidation.profile();
  });
}

/**
 * Disables 2FA for the current user.
 *
 * @param data - { password, totpCode } — requires verification before disabling
 */
export async function disableTwoFactorAction(data: DisableTwoFactorInput) {
  return withSelf(async () => {
    await disableTwoFactor(data);
    settingsRevalidation.profile();
  });
}
