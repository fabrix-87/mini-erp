// services/server/auth.ts
import { cookies } from 'next/headers';
import { serverApi } from '@/lib/server/api';
import { AuthResponse } from '@/types/api'; 

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
    console.log('🔄 Refreshing tokens...');
    
    // ✅ Backend restituisce token nel body (come per login)
    const data = await serverApi.post<AuthResponse>('/users/refresh-token', {});

    if (!data.accessToken || !data.refreshToken) {
      console.error('❌ Tokens missing in refresh response');
      return null;
    }

    // ✅ Aggiorna i cookie
    const isProduction = process.env.NODE_ENV === 'production';
    
    cookieStore.set('accessToken', data.accessToken, { 
      httpOnly: true, 
      secure: isProduction, 
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 15 // 15 minuti
    });
    
    cookieStore.set('refreshToken', data.refreshToken, { 
      httpOnly: true, 
      secure: isProduction, 
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 giorni
    });

    // ✅ Aggiorna anche il cookie 'user' se presente
    if (data.user) {
      cookieStore.set('user', JSON.stringify(data.user), {
        httpOnly: false,
        secure: isProduction,
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 15
      });
    }

    console.log('✅ Tokens refreshed successfully');
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
    await serverApi.post('/users/logout', {}); 
  } catch (error) {
    // Logghiamo l'errore ma non blocchiamo il flusso.
    // Se il token è scaduto o il server è giù, vogliamo comunque
    // pulire i cookie locali.
    console.warn('⚠️ Backend logout failed (cleaning up locally anyway):', error);
  }
}