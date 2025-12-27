// lib/server/api-route.ts
import { NextRequest, NextResponse } from 'next/server';
import { addFingerprintHeader } from './fingerprint';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

/**
 * Helper per fare proxy di richieste verso backend da Route Handlers
 * Preserva Set-Cookie headers e aggiunge automaticamente fingerprint
 */
export async function proxyToBackend(
  endpoint: string,
  request: NextRequest,
  options?: {
    additionalHeaders?: Record<string, string>;
  }
): Promise<NextResponse> {
  const body = await request.json();
  
  // Aggiungi automaticamente fingerprint + altri headers
  const headers = await addFingerprintHeader(request, {
    'Content-Type': 'application/json',
    'Cookie': request.headers.get('cookie') || '',
    ...options?.additionalHeaders,
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: request.method,
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const nextResponse = NextResponse.json(data, { status: 200 });

  // Propaga Set-Cookie headers
  const setCookieHeaders = response.headers.getSetCookie();
  setCookieHeaders.forEach((cookie) => {
    nextResponse.headers.append('Set-Cookie', cookie);
  });

  return nextResponse;
}
