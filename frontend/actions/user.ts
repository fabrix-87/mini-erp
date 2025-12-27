// app/actions/user.ts
'use server';

import { requireAdmin, requirePermission } from '@/lib/server/auth';
import { revalidateTags, userRevalidation } from '@/lib/server/revalidate';
import { createUser, deleteUser, toggleUserActive, updateUserDetails, updateUserProfile, updateUserRoles } from '@/services/server/user';
import { ServerApiError } from '@/types/server-client';
import { revalidateTag, revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';



// ============================================================================
// Types
// ============================================================================

interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
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
      if (error.status === 401) {
        redirect('/login');
      }
      if (error.status === 403) {
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
      error: 'Errore imprevisto',
    };
  }
}

// ============================================================================
// User CRUD Actions
// ============================================================================

/**
 * Create new user
 */
export async function createUserAction(formData: FormData): Promise<ActionResult> {
  return withAuth(async () => {
    const data = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      roleIds: JSON.parse(formData.get('roleIds') as string || '[]'),
      details: {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
      },
    };

    const user = await createUser(data);

    // Revalidate cache
    userRevalidation.list()

    return user;
  }, 'user:create');
}

/**
 * Update user profile
 */
export async function updateUserProfileAction(
  userId: number,
  data: {
    username?: string;
    email?: string;
  }
): Promise<ActionResult> {
  return withAuth(async () => {
    const user = await updateUserProfile(userId, data);

    // Revalidate specific user and list
    userRevalidation.userWithList(userId)

    return user;
  }, 'user:update');
}

/**
 * Update user details
 */
export async function updateUserDetailsAction(
  userId: number,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }
): Promise<ActionResult> {
  return withAuth(async () => {
    const user = await updateUserDetails(userId, data);

    // Revalidate
    userRevalidation.userWithList(userId)

    return user;
  }, 'user:update');
}

/**
 * Update user roles
 */
export async function updateUserRolesAction(
  userId: number,
  roleIds: number[]
): Promise<ActionResult> {
  return withAuth(async () => {
    const user = await updateUserRoles(userId, roleIds);

    // Revalidate
    userRevalidation.userWithList(userId)

    return user;
  }, 'user:manage');
}

/**
 * Toggle user active status
 */
export async function toggleUserActiveAction(
  userId: number,
  active: boolean
): Promise<ActionResult> {
  return withAuth(async () => {
    await toggleUserActive(userId, active);

    // Revalidate
    userRevalidation.userWithList(userId)

    return { active };
  }, 'user:update');
}

/**
 * Delete user
 */
export async function deleteUserAction(userId: number): Promise<ActionResult> {
  return withAuth(async () => {
    await deleteUser(userId);

    // Revalidate
    userRevalidation.list()

    // Redirect to list
    redirect('/users');
  }, 'user:delete');
}

// ============================================================================
// Batch Actions
// ============================================================================

/**
 * Bulk toggle active status
 */
export async function bulkToggleActiveAction(
  userIds: number[],
  active: boolean
): Promise<ActionResult> {
  return withAuth(async () => {
    const promises = userIds.map((id) => toggleUserActive(id, active));
    await Promise.all(promises);

    // Revalidate all
    userIds.forEach((id) => userRevalidation.user(id));
    userRevalidation.list();

    return { count: userIds.length };
  }, 'user:manage');
}

/**
 * Bulk delete users
 */
export async function bulkDeleteUsersAction(
  userIds: number[]
): Promise<ActionResult> {
  return withAuth(async () => {
    const promises = userIds.map((id) => deleteUser(id));
    await Promise.all(promises);

    // Revalidate
    userRevalidation.list();

    return { count: userIds.length };
  }, 'user:delete');
}

// ============================================================================
// Validation Actions
// ============================================================================

/**
 * Check if username is available
 */
export async function checkUsernameAvailability(
  username: string
): Promise<ActionResult<{ available: boolean }>> {
  // This would call a backend endpoint to check
  // For now, simple client-side validation
  const isValid = username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);

  return {
    success: true,
    data: { available: isValid },
  };
}

/**
 * Check if email is available
 * TODO
 */
export async function checkEmailAvailability(
  email: string
): Promise<ActionResult<{ available: boolean }>> {
  // This would call a backend endpoint to check
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return {
    success: true,
    data: { available: isValid },
  };
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
}): Promise<ActionResult<{ url: string }>> {
  return withAuth(async () => {
    // This would call backend export endpoint
    // For now, return mock URL
    const url = `/api/users/export?${new URLSearchParams(
      filters as any
    ).toString()}`;

    return { url };
  }, 'user:read');
}