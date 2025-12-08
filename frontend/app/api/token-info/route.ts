// app/api/token-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  
  if (!accessToken) {
    return NextResponse.json({ exp: null }, { status: 401 });
  }

  try {
    const decoded = decodeJwt(accessToken);
    return NextResponse.json({ 
      exp: decoded.exp,
      iat: decoded.iat 
    });
  } catch (error) {
    console.error("Errore decodifica token:", error);
    return NextResponse.json({ exp: null }, { status: 401 });
  }
}
