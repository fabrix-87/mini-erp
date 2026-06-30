"use server";

import { withSelf } from "@/lib/server/action";
import { updatePassword } from "@/services/server/user-settings-service";
import type { ChangePasswordInput } from "@mini-erp/shared/types";

/**
 * Changes the current user's password.
 * Requires the current password for verification.
 *
 * @param data - { currentPassword, newPassword, confirmPassword }
 */
export async function updatePasswordAction(data: ChangePasswordInput) {
  return withSelf(async () => {
    await updatePassword(data);
  });
}
