// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      // Se non c'è token, fai solo cleanup locale
      const response = NextResponse.json({
        status: 'success',
        message: 'Logged out locally',
      });

      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');

      return response;
    }

    // Forward logout request al backend
    const response = await fetch(`${API_BASE_URL}/api/users/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `accessToken=${accessToken}`,
      },
      credentials: 'include',
    });

    // Anche se il backend fallisce, cleanup locale
    const nextResponse = NextResponse.json(
      {
        status: 'success',
        message: 'Logout effettuato con successo',
      },
      { status: 200 }
    );

    // Clear cookies
    nextResponse.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    nextResponse.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/api/users/refresh-token',
    });

    return nextResponse;
  } catch (error) {
    console.error('❌ Logout route error:', error);
    
    // Anche in caso di errore, pulisci i cookie locali
    const response = NextResponse.json(
      {
        status: 'success',
        message: 'Logged out locally',
      },
      { status: 200 }
    );

    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;
  }
}
