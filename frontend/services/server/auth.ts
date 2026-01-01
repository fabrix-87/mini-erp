// services/server/auth.ts
import { cookies } from 'next/headers';
import { serverApi } from '@/lib/server/api';
import { AuthResponse } from '@/types/api'; 

export async function performTokenRefresh() {
  const cookieStore = await cookies();
  const currentRefreshToken = cookieStore.get('refreshToken')?.value;
  
  if (!currentRefreshToken) return null;

  try {
    const { data, headers } = await serverApi.post<AuthResponse>(
      '/users/refresh-token', 
      {}, 
      { returnHeaders: true } // Vogliamo anche i cookie nuovi
    );

    if (data.accessToken && data.refreshToken) {
        cookieStore.set('accessToken', data.accessToken, { httpOnly: true, secure: true, path: '/' });
        cookieStore.set('refreshToken', data.refreshToken, { httpOnly: true, secure: true, path: '/' });
        return data;
    }
    
    return null;
  } catch (error) {
    console.error("❌ Refresh failed:", error);
    return null;
  }
}

/**
 * Notifica il backend del logout.
 * Non lancia errori se fallisce: il logout locale deve avvenire comunque.
 */
export async function logoutUser(): Promise<void> {
  try {
    await serverApi.post('/users/logout', {}); 
  } catch (error) {
    // Logghiamo l'errore ma non blocchiamo il flusso.
    // Se il token è scaduto o il server è giù, vogliamo comunque
    // pulire i cookie locali.
    console.warn('⚠️ Backend logout failed (cleaning up locally anyway):', error);
  }
}