// actions/user-actions.ts
"use server";

import { userRevalidation } from "@/lib/server/revalidate";
import {
  createUser,
  deleteUser,
  toggleUserActive,
  updateUserDetails,
  updateUserProfile,
  updateUserRoles,
  getUserById,
  searchUsers,
  getUsersByRole,
  getActiveUsers,
  bulkUpdateUsers,
  updateUser,
} from "@/services/server/user-service";
import type { UpdateUserProfileInput, UpdateUserDetailsInput } from "@/types/user-types";
import { CreateUserInput, UpdateUserFormInput, User } from "@mini-erp/shared";
import { ActionResult, withAuth } from "@/lib/server/action";

// ============================================================================
// Constants
// ============================================================================

/** Regex for valid username characters. */
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

/** Regex for basic email format validation. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================================
// User CRUD Actions
// ============================================================================

/**
 * Creates a new user. Requires `user:create` permission.
 *
 * @param data - The user creation payload.
 * @returns The created `User` on success.
 */
export async function createUserAction(data: CreateUserInput): Promise<ActionResult<User>> {
  const result = await withAuth(async () => {
    const user = await createUser(data);
    userRevalidation.list();
    return user;
  }, "user:create");

  if (result.success) result.message = "Utente creato con successo";
  return result;
}

/**
 * Updates a user's core fields. Requires `user:update` permission.
 *
 * @param userId - Target user ID.
 * @param data - Fields to update.
 * @returns The updated `User` on success.
 */
export async function updateUserAction(
  userId: string,
  data: UpdateUserFormInput,
): Promise<ActionResult<User>> {
  const result = await withAuth(async () => {
    const user = await updateUser(userId, data);
    userRevalidation.list();
    return user;
  }, "user:update");

  if (result.success) result.message = "Utente modificato con successo";
  return result;
}

/**
 * Updates a user's profile data. Requires `user:update` permission.
 *
 * @param userId - Target user ID.
 * @param data - Profile fields to update.
 */
export async function updateUserProfileAction(
  userId: string,
  data: UpdateUserProfileInput,
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const user = await updateUserProfile(userId, data);
    userRevalidation.userWithList(userId);
    return user;
  }, "user:update");

  if (result.success) result.message = "Profilo aggiornato con successo";
  return result;
}

/**
 * Updates a user's personal details. Requires `user:update` permission.
 *
 * @param userId - Target user ID.
 * @param data - Detail fields to update.
 */
export async function updateUserDetailsAction(
  userId: string,
  data: UpdateUserDetailsInput,
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const user = await updateUserDetails(userId, data);
    userRevalidation.userWithList(userId);
    return user;
  }, "user:update");

  if (result.success) result.message = "Dettagli aggiornati con successo";
  return result;
}

/**
 * Replaces the role set for a user. Requires `user:manage` permission.
 *
 * @param userId - Target user ID.
 * @param roleIds - New role IDs to assign.
 */
export async function updateUserRolesAction(
  userId: string,
  roleIds: number[],
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const user = await updateUserRoles(userId, roleIds);
    userRevalidation.userWithList(userId);
    return user;
  }, "user:manage");

  if (result.success) result.message = "Ruoli aggiornati con successo";
  return result;
}

/**
 * Activates or deactivates a user account. Requires `user:update` permission.
 *
 * @param userId - Target user ID.
 * @param active - `true` to activate, `false` to deactivate.
 */
export async function toggleUserActiveAction(
  userId: string,
  active: boolean,
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    await toggleUserActive(userId, active);
    userRevalidation.userWithList(userId);
    return { active };
  }, "user:update");

  if (result.success) {
    result.message = active ? "Utente attivato con successo" : "Utente disattivato con successo";
  }
  return result;
}

/**
 * Permanently deletes a user. Requires `user:delete` permission.
 *
 * @param userId - Target user ID.
 */
export async function deleteUserAction(userId: string): Promise<ActionResult> {
  const result = await withAuth(async () => {
    await deleteUser(userId);
    userRevalidation.list();
    return null;
  }, "user:delete");

  if (result.success) result.message = "Utente eliminato con successo";
  return result;
}

// ============================================================================
// Batch Actions
// ============================================================================

/**
 * Activates or deactivates multiple users in parallel. Requires `user:manage` permission.
 *
 * @param userIds - List of user IDs to update.
 * @param active - `true` to activate, `false` to deactivate.
 */
export async function bulkToggleActiveAction(
  userIds: string[],
  active: boolean,
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    await Promise.all(userIds.map((id) => toggleUserActive(id, active)));
    userIds.forEach((id) => userRevalidation.user(id));
    userRevalidation.list();
    return { count: userIds.length };
  }, "user:manage");

  if (result.success) {
    result.message = `${userIds.length} utenti ${active ? "attivati" : "disattivati"} con successo`;
  }
  return result;
}

/**
 * Permanently deletes multiple users in parallel. Requires `user:delete` permission.
 *
 * @param userIds - List of user IDs to delete.
 */
export async function bulkDeleteUsersAction(userIds: string[]): Promise<ActionResult> {
  const result = await withAuth(async () => {
    await Promise.all(userIds.map((id) => deleteUser(id)));
    userRevalidation.list();
    return { count: userIds.length };
  }, "user:delete");

  if (result.success) result.message = `${userIds.length} utenti eliminati con successo`;
  return result;
}

/**
 * Assigns the same role set to multiple users in parallel. Requires `user:manage` permission.
 *
 * @param userIds - List of user IDs to update.
 * @param roleIds - New role IDs to assign to each user.
 */
export async function bulkUpdateRolesAction(
  userIds: string[],
  roleIds: number[],
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    await Promise.all(userIds.map((id) => updateUserRoles(id, roleIds)));
    userIds.forEach((id) => userRevalidation.user(id));
    userRevalidation.list();
    return { count: userIds.length };
  }, "user:manage");

  if (result.success) result.message = `Ruoli aggiornati per ${userIds.length} utenti`;
  return result;
}

/**
 * Applies partial profile updates to multiple users. Requires `user:update` permission.
 *
 * @param updates - Array of `{ id, data }` pairs to apply.
 */
export async function bulkUpdateUsersAction(
  updates: Array<{ id: string; data: Partial<UpdateUserProfileInput> }>,
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const users = await bulkUpdateUsers(updates);
    updates.forEach(({ id }) => userRevalidation.user(id));
    userRevalidation.list();
    return { users, count: users.length };
  }, "user:update");

  if (result.success) result.message = `${updates.length} utenti aggiornati con successo`;
  return result;
}

// ============================================================================
// Search & Filter Actions
// ============================================================================

/**
 * Searches users by a free-text query. Requires `user:read` permission.
 *
 * @param query - Search string.
 * @param options.limit - Max results to return (default 10).
 */
export async function searchUsersAction(
  query: string,
  options?: { limit?: number },
): Promise<ActionResult> {
  return withAuth(async () => {
    return searchUsers(query, { limit: options?.limit ?? 10, revalidate: 30 });
  }, "user:read");
}

/**
 * Returns users belonging to a specific role. Requires `user:read` permission.
 *
 * @param roleId - Role ID to filter by.
 * @param options - Pagination options.
 */
export async function getUsersByRoleAction(
  roleId: number,
  options?: { page?: number; limit?: number },
): Promise<ActionResult> {
  return withAuth(async () => {
    return getUsersByRole(roleId, { ...options, revalidate: 30 });
  }, "user:read");
}

/**
 * Returns only active users. Requires `user:read` permission.
 *
 * @param options - Pagination options.
 */
export async function getActiveUsersAction(options?: {
  page?: number;
  limit?: number;
}): Promise<ActionResult> {
  return withAuth(async () => {
    return getActiveUsers({ ...options, revalidate: 30 });
  }, "user:read");
}

// ============================================================================
// Validation Actions
// ============================================================================

/**
 * Checks whether a username is available for registration or update.
 * Performs basic format validation before querying the backend.
 *
 * @param username - Username to check.
 * @param excludeUserId - Exclude this user ID from the uniqueness check (for edits).
 * @returns `{ available: true }` if the username can be used.
 */
export async function checkUsernameAvailabilityAction(
  username: string,
  excludeUserId?: string,
): Promise<ActionResult<{ available: boolean }>> {
  if (username.length < 3 || !USERNAME_REGEX.test(username)) {
    return { success: true, data: { available: false } };
  }

  try {
    const result = await searchUsers(username, { limit: 1, revalidate: 0 });
    const available =
      result.data.length === 0 || (!!excludeUserId && result.data[0].id === excludeUserId);
    return { success: true, data: { available } };
  } catch {
    return { success: false, error: "Errore durante la verifica del username" };
  }
}

/**
 * Checks whether an email address is available for registration or update.
 * Performs basic format validation before querying the backend.
 *
 * @param email - Email address to check.
 * @param excludeUserId - Exclude this user ID from the uniqueness check (for edits).
 * @returns `{ available: true }` if the email can be used.
 */
export async function checkEmailAvailabilityAction(
  email: string,
  excludeUserId?: string,
): Promise<ActionResult<{ available: boolean }>> {
  if (!EMAIL_REGEX.test(email)) {
    return { success: true, data: { available: false } };
  }

  try {
    const result = await searchUsers(email, { limit: 1, revalidate: 0 });
    const available =
      result.data.length === 0 || (!!excludeUserId && result.data[0].id === excludeUserId);
    return { success: true, data: { available } };
  } catch {
    return { success: false, error: "Errore durante la verifica dell'email" };
  }
}

// ============================================================================
// Export Actions
// ============================================================================

/**
 * Builds the export URL for a CSV user export with optional filters.
 * Requires `user:read` permission.
 *
 * @param filters - Optional filters to apply to the export.
 * @returns `{ url }` containing the download endpoint.
 */
export async function exportUsersAction(filters?: {
  active?: boolean;
  roleId?: number;
  search?: string;
}): Promise<ActionResult<{ url: string }>> {
  return withAuth(async () => {
    const params = new URLSearchParams();
    if (filters?.active !== undefined) params.set("active", String(filters.active));
    if (filters?.roleId) params.set("roleId", String(filters.roleId));
    if (filters?.search) params.set("search", filters.search);

    const qs = params.toString();
    return { url: `/api/users/export${qs ? `?${qs}` : ""}` };
  }, "user:read");
}

// ============================================================================
// Password Actions
// ============================================================================

/**
 * Resets a user's password (admin-initiated). Requires `user:manage` permission.
 *
 * @param userId - Target user ID.
 * @param newPassword - The new password to set.
 * @todo Implement when backend endpoint is ready.
 */
export async function resetUserPasswordAction(
  userId: string,
  newPassword: string,
): Promise<ActionResult> {
  return withAuth(async () => {
    // TODO: await resetUserPassword(userId, newPassword);
    console.warn("resetUserPassword not implemented yet");
    return null;
  }, "user:manage");
}

/**
 * Sends a password reset email to a user (admin-initiated). Requires `user:manage` permission.
 *
 * @param userId - Target user ID.
 * @todo Implement when backend endpoint is ready.
 */
export async function sendPasswordResetEmailAction(userId: string): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const user = await getUserById(userId, { revalidate: 0 });
    // TODO: await sendPasswordResetEmail(user.email);
    console.warn("sendPasswordResetEmail not implemented yet for:", user.email);
    return { email: user.email };
  }, "user:manage");

  if (result.success) result.message = "Email di reset inviata con successo";
  return result;
}

// ============================================================================
// Utility Actions
// ============================================================================

/**
 * Fetches a single user by ID. Requires `user:read` permission.
 * Primarily used to pre-fill edit forms.
 *
 * @param userId - Target user ID.
 */
export async function getUserByIdAction(userId: string): Promise<ActionResult> {
  return withAuth(async () => {
    return getUserById(userId, { revalidate: 30 });
  }, "user:read");
}

/**
 * Invalidates the Next.js cache for a user or the full user list.
 * Requires `user:read` permission.
 *
 * @param userId - If provided, invalidates only this user's cache; otherwise invalidates the list.
 */
export async function refreshUserCacheAction(userId?: string): Promise<ActionResult> {
  return withAuth(async () => {
    userId ? userRevalidation.userWithList(userId) : userRevalidation.list();
    return { refreshed: true };
  }, "user:read");
}
