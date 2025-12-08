import { UserAuth } from "@/types/api";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

// ⭐ Helper per verificare il JWT (riutilizzabile)
export async function verifyToken(token: string): Promise<UserAuth | null> {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error("❌ JWT_SECRET non configurato");
      return null;
    }

    if (jwtSecret.length < 32) {
      console.error("❌ JWT_SECRET troppo corto (minimo 32 caratteri)");
      return null;
    }

    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    
    return payload as unknown as UserAuth;
  } catch (error) {
    console.error("❌ JWT verification failed:", error);
    return null;
  }
}

// ⭐ Helper per controllare se l'utente è admin
export function isAdmin(user: UserAuth): boolean {
  return user.roles?.some(
    (role) => role.code === "admin" || role.code === "ADMIN"
  ) ?? false;
}

// ⭐ Helper per aggiungere header utente
export function addUserHeaders(response: NextResponse, user: UserAuth): NextResponse {
  response.headers.set("x-user-id", user.userId.toString());
  response.headers.set("x-user-email", user.email);
  response.headers.set("x-user-username", user.username);
  response.headers.set("x-user-roles", JSON.stringify(user.roles));
  return response;
}