// services/server/user.ts

import { serverApi } from '@/lib/server/api';

import type {
  User,
  UpdateUserDetailsInput,
  UpdateUserProfileInput,
  UserListApiResponse
} from '@/types/user'
import { ApiResponse } from '@mini-erp/shared';
import { PaginatedResponse } from '@mini-erp/shared/types';

// ============================================================================
// Cache Tags
// ============================================================================

const USER_TAGS = {
  list: 'users-list',
  detail: (id: number) => `user-${id}`,
  profile: 'user-profile',
};

// ============================================================================
// Current User Functions
// ============================================================================

/**
 * Get current user data
 * Con cache strategy
 */
export async function getUser(options?: {
  revalidate?: number | false;
}): Promise<User> {
  return serverApi.get<User>('/users/me', {
    revalidate: options?.revalidate ?? 60,
    tags: [USER_TAGS.profile],
  });
}

/**
 * Update current user profile
 * Invalida cache automaticamente
 */
export async function updateProfile(data: UpdateUserProfileInput): Promise<User> {
  return serverApi.put<User>('/users/me/profile', data, {
    tags: [USER_TAGS.profile],
    revalidate: false,
  });
}

/**
 * Update current user details
 */
export async function updateDetails(data: UpdateUserDetailsInput): Promise<User> {
  return serverApi.put<User>('/users/me/details', data, {
    tags: [USER_TAGS.profile],
    revalidate: false,
  });
}

/**
 * Change current user password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await serverApi.put<void>('/users/me/change-password', {
    currentPassword,
    newPassword,
  }, {
    revalidate: false,
  });
}

// ============================================================================
// Admin User Management Functions
// ============================================================================

/**
 * Get all users with filters and pagination
 * Con cache per performance
 */
export async function getAllUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  roleId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  revalidate?: number | false;
}): Promise<UserListApiResponse> {
  const { revalidate = 30, ...queryParams } = params || {};

  return serverApi.get<UserListApiResponse>('/users', {
    params: queryParams,
    revalidate,
    tags: [USER_TAGS.list],
    unwrapData: false
  });
}

/**
 * Get user by ID
 * Con cache per dettagli utente
 */
export async function getUserById(
  id: number,
  options?: { revalidate?: number | false }
): Promise<User> {
  return serverApi.get<User>(`/users/${id}`, {
    revalidate: options?.revalidate ?? 60,
    tags: [USER_TAGS.detail(id), USER_TAGS.list],
  });
}

/**
 * Create new user (admin only)
 */
export async function createUser(data: {
  username: string;
  email: string;
  password: string;
  roleIds?: number[];
  preferredLanguageId?: number;
  details?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}): Promise<User> {
  return serverApi.post<User>('/users', data, {
    tags: [USER_TAGS.list],
    revalidate: false,
  });
}

/**
 * Update user profile (admin)
 */
export async function updateUserProfile(
  id: number,
  data: UpdateUserProfileInput
): Promise<User> {
  return serverApi.put<User>(`/users/${id}/profile`, data, {
    tags: [USER_TAGS.detail(id), USER_TAGS.list],
    revalidate: false,
  });
}

/**
 * Update user details (admin)
 */
export async function updateUserDetails(
  id: number,
  data: UpdateUserDetailsInput
): Promise<User> {
  return serverApi.put<User>(`/users/${id}/details`, data, {
    tags: [USER_TAGS.detail(id), USER_TAGS.list],
    revalidate: false,
  });
}

/**
 * Update user roles (admin)
 */
export async function updateUserRoles(
  id: number,
  roleIds: number[]
): Promise<User> {
  return serverApi.put<User>(`/users/${id}/roles`, { roleIds }, {
    tags: [USER_TAGS.detail(id), USER_TAGS.list],
    revalidate: false,
  });
}

/**
 * Toggle user active status (admin)
 */
export async function toggleUserActive(
  id: number,
  active: boolean
): Promise<void> {
  await serverApi.patch<void>(`/users/${id}/toggle-active`, { active }, {
    tags: [USER_TAGS.detail(id), USER_TAGS.list],
    revalidate: false,
  });
}

/**
 * Delete user (admin)
 */
export async function deleteUser(id: number): Promise<void> {
  await serverApi.delete<void>(`/users/${id}`, {
    tags: [USER_TAGS.detail(id), USER_TAGS.list],
    revalidate: false,
  });
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Get multiple users by IDs
 * Con parallelizzazione
 */
export async function getUsersByIds(
  ids: number[],
  options?: { revalidate?: number | false }
): Promise<User[]> {
  const promises = ids.map((id) => getUserById(id, options));
  return Promise.all(promises);
}

/**
 * Bulk update users
 */
export async function bulkUpdateUsers(
  updates: Array<{ id: number; data: Partial<UpdateUserProfileInput> }>
): Promise<User[]> {
  const promises = updates.map(({ id, data }) =>
    updateUserProfile(id, data as UpdateUserProfileInput)
  );
  return Promise.all(promises);
}

// ============================================================================
// Search & Filter Helpers
// ============================================================================

/**
 * Search users by email or username
 */
export async function searchUsers(
  query: string,
  options?: {
    limit?: number;
    revalidate?: number | false;
  }
): Promise<ApiResponse<User[]>> {
  return getAllUsers({
    search: query,
    limit: options?.limit ?? 10,
    revalidate: options?.revalidate ?? 30,
  });
}

/**
 * Get users by role
 */
export async function getUsersByRole(
  roleId: number,
  options?: {
    page?: number;
    limit?: number;
    revalidate?: number | false;
  }
): Promise<ApiResponse<User[]>> {
  return getAllUsers({
    roleId,
    page: options?.page,
    limit: options?.limit,
    revalidate: options?.revalidate ?? 30,
  });
}

/**
 * Get active users only
 */
export async function getActiveUsers(options?: {
  page?: number;
  limit?: number;
  revalidate?: number | false;
}): Promise<ApiResponse<User[]>> {
  return getAllUsers({
    active: true,
    page: options?.page,
    limit: options?.limit,
    revalidate: options?.revalidate ?? 30,
  });
}

// ============================================================================
// Statistics & Analytics
// ============================================================================

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}> {
  const users = await getAllUsers({ limit: 1000, revalidate: 60 }) as PaginatedResponse<User>;

  const stats = {
    total: users.pagination.totalItems,
    active: 0,
    inactive: 0,
    byRole: {} as Record<string, number>,
  };

  users.data.forEach((user) => {
    if (user.active) {
      stats.active++;
    } else {
      stats.inactive++;
    }

    user.roles?.forEach((role: any) => {
      stats.byRole[role.code] = (stats.byRole[role.code] || 0) + 1;
    });
  });

  return stats;
}
