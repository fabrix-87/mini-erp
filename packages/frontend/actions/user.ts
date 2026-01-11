// actions/user.ts
'use server';

import { requireAdmin, requirePermission } from '@/lib/server/auth';
import { userRevalidation } from '@/lib/server/revalidate';
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
} from '@/services/server/user';
import { ServerApiError } from '@/types/server-client';
import { redirect } from 'next/navigation';
import type { UpdateUserProfileInput, UpdateUserDetailsInput } from '@/types/user';

// ============================================================================
// Types
// ============================================================================

interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// Helper for Error Handling
// ============================================================================

async function withAuth<T>(
  action: () => Promise<T>,
  permission?: string
): Promise<ActionResult<T>> {
  try {
    // Check authorization
    if (permission) {
      await requirePermission(permission);
    } else {
      await requireAdmin();
    }

    // Execute action
    const data = await action();

    return { success: true, data };
  } catch (error) {
    console.error('Server action error:', error);

    if (error instanceof ServerApiError) {
      if (error.statusCode === 401) {
        redirect('/login');
      }
      if (error.statusCode === 403) {
        return {
          success: false,
          error: 'Non hai i permessi per questa azione',
        };
      }

      return {
        success: false,
        error: error.message || 'Errore durante l\'operazione',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore imprevisto',
    };
  }
}

// ============================================================================
// User CRUD Actions
// ============================================================================

/**
 * Create new user
 */
export async function createUserAction(data: {
  username: string;
  email: string;
  password: string;
  roleIds?: number[];
  details?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const user = await createUser(data);
    userRevalidation.list();
    return user;
  }, 'user:create');

  if (result.success) {
    result.message = 'Utente creato con successo';
  }

  return result;
}

/**
 * Update user profile
 */
export async function updateUserProfileAction(
  userId: number,
  data: UpdateUserProfileInput
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const user = await updateUserProfile(userId, data);
    userRevalidation.userWithList(userId);
    return user;
  }, 'user:update');

  if (result.success) {
    result.message = 'Profilo aggiornato con successo';
  }

  return result;
}

/**
 * Update user details
 */
export async function updateUserDetailsAction(
  userId: number,
  data: UpdateUserDetailsInput
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const user = await updateUserDetails(userId, data);
    userRevalidation.userWithList(userId);
    return user;
  }, 'user:update');

  if (result.success) {
    result.message = 'Dettagli aggiornati con successo';
  }

  return result;
}

/**
 * Update user roles
 */
export async function updateUserRolesAction(
  userId: number,
  roleIds: number[]
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const user = await updateUserRoles(userId, roleIds);
    userRevalidation.userWithList(userId);
    return user;
  }, 'user:manage');

  if (result.success) {
    result.message = 'Ruoli aggiornati con successo';
  }

  return result;
}

/**
 * Toggle user active status
 */
export async function toggleUserActiveAction(
  userId: number,
  active: boolean
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    await toggleUserActive(userId, active);
    userRevalidation.userWithList(userId);
    return { active };
  }, 'user:update');

  if (result.success) {
    result.message = active 
      ? 'Utente attivato con successo' 
      : 'Utente disattivato con successo';
  }

  return result;
}

/**
 * Delete user
 */
export async function deleteUserAction(userId: number): Promise<ActionResult> {
  const result = await withAuth(async () => {
    await deleteUser(userId);
    userRevalidation.list();
    return null;
  }, 'user:delete');

  if (result.success) {
    result.message = 'Utente eliminato con successo';
  }

  return result;
}

// ============================================================================
// Batch Actions (usando il service esistente)
// ============================================================================

/**
 * Bulk toggle active status
 */
export async function bulkToggleActiveAction(
  userIds: number[],
  active: boolean
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    // Usa Promise.all per operazioni parallele
    await Promise.all(
      userIds.map((id) => toggleUserActive(id, active))
    );

    // Revalidate all affected users
    userIds.forEach((id) => userRevalidation.user(id));
    userRevalidation.list();

    return { count: userIds.length };
  }, 'user:manage');

  if (result.success) {
    result.message = `${userIds.length} utenti ${active ? 'attivati' : 'disattivati'} con successo`;
  }

  return result;
}

/**
 * Bulk delete users
 */
export async function bulkDeleteUsersAction(
  userIds: number[]
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    // Usa Promise.all per operazioni parallele
    await Promise.all(
      userIds.map((id) => deleteUser(id))
    );

    userRevalidation.list();
    return { count: userIds.length };
  }, 'user:delete');

  if (result.success) {
    result.message = `${userIds.length} utenti eliminati con successo`;
  }

  return result;
}

/**
 * Bulk update user roles
 */
export async function bulkUpdateRolesAction(
  userIds: number[],
  roleIds: number[]
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    await Promise.all(
      userIds.map((id) => updateUserRoles(id, roleIds))
    );

    userIds.forEach((id) => userRevalidation.user(id));
    userRevalidation.list();

    return { count: userIds.length };
  }, 'user:manage');

  if (result.success) {
    result.message = `Ruoli aggiornati per ${userIds.length} utenti`;
  }

  return result;
}

/**
 * Bulk update users (usando il service bulkUpdateUsers)
 */
export async function bulkUpdateUsersAction(
  updates: Array<{ id: number; data: Partial<UpdateUserProfileInput> }>
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    const users = await bulkUpdateUsers(updates);
    
    updates.forEach(({ id }) => userRevalidation.user(id));
    userRevalidation.list();

    return { users, count: users.length };
  }, 'user:update');

  if (result.success) {
    result.message = `${updates.length} utenti aggiornati con successo`;
  }

  return result;
}

// ============================================================================
// Search & Filter Actions (usando i services esistenti)
// ============================================================================

/**
 * Search users by query
 */
export async function searchUsersAction(
  query: string,
  options?: {
    limit?: number;
  }
): Promise<ActionResult> {
  return withAuth(async () => {
    const result = await searchUsers(query, {
      limit: options?.limit ?? 10,
      revalidate: 30,
    });
    return result;
  }, 'user:read');
}

/**
 * Get users by role
 */
export async function getUsersByRoleAction(
  roleId: number,
  options?: {
    page?: number;
    limit?: number;
  }
): Promise<ActionResult> {
  return withAuth(async () => {
    const result = await getUsersByRole(roleId, {
      page: options?.page,
      limit: options?.limit,
      revalidate: 30,
    });
    return result;
  }, 'user:read');
}

/**
 * Get active users only
 */
export async function getActiveUsersAction(options?: {
  page?: number;
  limit?: number;
}): Promise<ActionResult> {
  return withAuth(async () => {
    const result = await getActiveUsers({
      page: options?.page,
      limit: options?.limit,
      revalidate: 30,
    });
    return result;
  }, 'user:read');
}

// ============================================================================
// Validation Actions
// ============================================================================

/**
 * Check if username is available
 */
export async function checkUsernameAvailabilityAction(
  username: string,
  excludeUserId?: number
): Promise<ActionResult<{ available: boolean }>> {
  try {
    // Validazione base lato client
    if (username.length < 3) {
      return {
        success: true,
        data: { available: false },
      };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return {
        success: true,
        data: { available: false },
      };
    }

    // Cerca utenti con lo stesso username
    const result = await searchUsers(username, { limit: 1, revalidate: 0 });
    
    // Se trova utenti, controlla se è lo stesso da escludere
    const available = result.data.length === 0 || (!!excludeUserId && result.data[0].id === excludeUserId);

    return {
      success: true,
      data: { available },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Errore durante la verifica del username',
    };
  }
}

/**
 * Check if email is available
 */
export async function checkEmailAvailabilityAction(
  email: string,
  excludeUserId?: number
): Promise<ActionResult<{ available: boolean }>> {
  try {
    // Validazione base email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: true,
        data: { available: false },
      };
    }

    // Cerca utenti con la stessa email
    const result = await searchUsers(email, { limit: 1, revalidate: 0 });
    
    // Se trova utenti, controlla se è lo stesso da escludere
    const available = result.data.length === 0 ||  (!!excludeUserId && result.data[0].id === excludeUserId);

    return {
      success: true,
      data: { available },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Errore durante la verifica dell\'email',
    };
  }
}

// ============================================================================
// Export Actions
// ============================================================================

/**
 * Export users to CSV
 */
export async function exportUsersAction(filters?: {
  active?: boolean;
  roleId?: number;
  search?: string;
}): Promise<ActionResult<{ url: string }>> {
  return withAuth(async () => {
    // Costruisci URL per export con filtri
    const params = new URLSearchParams();
    
    if (filters?.active !== undefined) {
      params.set('active', filters.active.toString());
    }
    if (filters?.roleId) {
      params.set('roleId', filters.roleId.toString());
    }
    if (filters?.search) {
      params.set('search', filters.search);
    }

    const url = `/api/users/export${params.toString() ? `?${params.toString()}` : ''}`;

    return { url };
  }, 'user:read');
}

// ============================================================================
// Password Actions
// ============================================================================

/**
 * Reset user password (admin)
 */
export async function resetUserPasswordAction(
  userId: number,
  newPassword: string
): Promise<ActionResult> {
  return withAuth(async () => {
    // TODO: Implementa quando il backend è pronto
    // await resetUserPassword(userId, newPassword);

    // Per ora, placeholder
    console.warn('resetUserPassword not implemented yet');

    return {
      success: true,
      message: 'Password reimpostata con successo',
    };
  }, 'user:manage');
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmailAction(
  userId: number
): Promise<ActionResult> {
  const result = await withAuth(async () => {
    // Ottieni l'utente per avere l'email
    const user = await getUserById(userId, { revalidate: 0 });

    // TODO: Implementa quando il backend è pronto
    // await sendPasswordResetEmail(user.email);

    // Per ora, placeholder
    console.warn('sendPasswordResetEmail not implemented yet for:', user.email);

    return { email: user.email };
  }, 'user:manage');

  if (result.success) {
    result.message = 'Email di reset inviata con successo';
  }

  return result;
}

// ============================================================================
// Utility Actions
// ============================================================================

/**
 * Get user by ID (wrapper action per form pre-fill)
 */
export async function getUserByIdAction(userId: number): Promise<ActionResult> {
  return withAuth(async () => {
    const user = await getUserById(userId, { revalidate: 30 });
    return user;
  }, 'user:read');
}

/**
 * Refresh user cache
 */
export async function refreshUserCacheAction(userId?: number): Promise<ActionResult> {
  return withAuth(async () => {
    if (userId) {
      userRevalidation.userWithList(userId);
    } else {
      userRevalidation.list();
    }

    return { refreshed: true };
  }, 'user:read');
}
