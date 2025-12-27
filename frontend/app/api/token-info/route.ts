// app/api/token-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

/**
 * GET /api/token-info
 * Returns decoded JWT payload info for client display
 * Used by SessionStatus component
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'No token found',
        },
        { status: 401 }
      );
    }

    // Verify JWT locally
    const payload = await verifyJWT(accessToken);

    if (!payload) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid token',
        },
        { status: 401 }
      );
    }

    // Return safe payload info (without sensitive data)
    return NextResponse.json({
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      roles: payload.roles,
      jti: payload.jti,
      iat: payload.iat,
      exp: payload.exp,
      iss: payload.iss,
      aud: payload.aud,
      fingerprint: payload.fingerprint ? 'enabled' : 'disabled',
    });
  } catch (error) {
    console.error('❌ Token info error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}