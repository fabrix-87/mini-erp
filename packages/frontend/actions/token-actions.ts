// actions/token.ts
'use server'

import { cookies } from 'next/headers';
import { performTokenRefresh } from '@/services/server/auth';
import { clearAuthCookies } from '@/lib/server/cookies';

/**
 * Server Action for token refresh.
 * If refresh fails due to invalid/expired refresh token (401),
 * it forces logout by clearing all auth cookies to break the infinite loop.
 */
export async function refreshTokenAction(): Promise<{ success: boolean; forceLogout?: boolean }> {
  try { 
    const result = await performTokenRefresh();

    if (!result) {
      console.error('❌ Token refresh failed');
      // Clear cookies to prevent redirect loop
      await clearAuthCookies();
      return { success: false, forceLogout: true };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Refresh token action error:', error);
    await clearAuthCookies();
    return { success: false, forceLogout: true };
  }
}

/**
 * Server Action to check if the user is authenticated via cookie presence.
 */
export async function checkAuthAction(): Promise<{ authenticated: boolean }> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  return { authenticated: !!accessToken };
}