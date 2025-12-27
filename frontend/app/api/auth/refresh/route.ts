// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'No refresh token found',
        },
        { status: 401 }
      );
    }

    // Forward refresh request al backend
    const response = await fetch(`${API_BASE_URL}/api/users/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Refresh token invalid or expired',
        },
        { status: 401 }
      );
    }

    const data = await response.json();

    // Estrai nuovi cookies
    const setCookieHeaders = response.headers.getSetCookie();

    const nextResponse = NextResponse.json(data, { status: 200 });

    // Propaga i nuovi cookies
    setCookieHeaders.forEach((cookie) => {
      const [nameValue, ...attributes] = cookie.split(';');
      const [name, value] = nameValue.split('=');

      const cookieOptions: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      };

      attributes.forEach((attr) => {
        const [key, val] = attr.trim().split('=');
        
        if (key.toLowerCase() === 'max-age') {
          cookieOptions.maxAge = parseInt(val);
        } else if (key.toLowerCase() === 'path') {
          cookieOptions.path = val;
        }
      });

      nextResponse.cookies.set(name, value, cookieOptions);
    });

    return nextResponse;
  } catch (error) {
    console.error('❌ Refresh route error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
