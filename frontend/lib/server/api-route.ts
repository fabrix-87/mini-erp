// lib/server/api-route.ts
import { NextRequest, NextResponse } from 'next/server';
import { addFingerprintHeader } from './fingerprint';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

interface ProxyOptions {
  additionalHeaders?: Record<string, string>;
  skipBodyParsing?: boolean;
}

/**
 * Helper per fare proxy di richieste verso backend da Route Handlers
 * Preserva Set-Cookie headers e aggiunge automaticamente fingerprint
 */
export async function proxyToBackend(
  endpoint: string,
  request: NextRequest,
  options?: ProxyOptions
): Promise<NextResponse> {
  try {
    // Parsing body solo se la richiesta ha un body
    let body: string | undefined;
    
    if (!options?.skipBodyParsing && request.body) {
      const data = await request.json();
      body = JSON.stringify(data);
    }

    // Aggiungi automaticamente fingerprint + altri headers
    const headers = addFingerprintHeader(request, {
      'Content-Type': 'application/json',
      'Cookie': request.headers.get('cookie') || '',
      ...options?.additionalHeaders,
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: request.method,
      headers,
      body,
      credentials: 'include',
    });

    const data = await response.json();

    // Crea response con lo stesso status del backend
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Propaga Set-Cookie headers
    const setCookieHeaders = response.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      nextResponse.headers.append('Set-Cookie', cookie);
    });

    return nextResponse;
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
