// services/server/auth.ts
import { cookies } from 'next/headers';
import { serverApi } from '@/lib/server/api';
import { AuthResponse } from '@/types/api'; 
import { setCookies } from '@/lib/server/cookies';

/**
 * Esegue refresh dei token chiamando il backend
 * ✅ Usa il body JSON per ricevere i nuovi token
 */
export async function performTokenRefresh(): Promise<AuthResponse | null> {
  const cookieStore = await cookies();
  const currentRefreshToken = cookieStore.get('refreshToken')?.value;
  
  if (!currentRefreshToken) {
    console.log('⚠️ No refresh token available');
    return null;
  }

  try {    
    // Backend restituisce token nel body (come per login)
    const data = await serverApi.post<AuthResponse>('/auth/refresh-token', {});

    if (!data.accessToken || !data.refreshToken) {
      console.error('❌ Tokens missing in refresh response');
      return null;
    }

    // Aggiorna i cookie
    setCookies(data.accessToken, data.refreshToken, data.user)

    return data;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return null;
  }
}

/**
 * Notifica il backend del logout.
 * Non lancia errori se fallisce: il logout locale deve avvenire comunque.
 */
export async function logoutUser(): Promise<void> {
  try {
    await serverApi.post('/auth/logout', {}); 
  } catch (error) {
    // Logghiamo l'errore ma non blocchiamo il flusso.
    // Se il token è scaduto o il server è giù, vogliamo comunque
    // pulire i cookie locali.
    console.warn('⚠️ Backend logout failed (cleaning up locally anyway):', error);
  }
}