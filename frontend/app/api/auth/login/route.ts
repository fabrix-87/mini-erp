// app/api/auth/login/route.ts

import { proxyToBackend } from '@/lib/server/api-route';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {  
    return await proxyToBackend('/users/login', request);
  } catch (error) {
    console.error('❌ Login route error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
