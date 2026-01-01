// actions/token.ts
'use server'

import { cookies } from 'next/headers';
import { performTokenRefresh } from '@/services/server/auth';

/**
 * Server Action per refresh token
 * Chiamata dal client quando riceve 401
 */
export async function refreshTokenAction(): Promise<{ success: boolean }> {
  try {
    console.log('🔄 Refresh token action called');
    
    const result = await performTokenRefresh();

    if (!result) {
      console.error('❌ Token refresh failed');
      return { success: false };
    }

    console.log('✅ Token refreshed successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Refresh token action error:', error);
    return { success: false };
  }
}

/**
 * Server Action per verificare se l'utente è autenticato
 * Utile per AuthProvider
 */
export async function checkAuthAction(): Promise<{ authenticated: boolean }> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  
  return { authenticated: !!accessToken };
}
