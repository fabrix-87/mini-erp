// lib/server/cookies.ts

import { cookies } from "next/headers";
import { ACCESS_TOKEN_LIFETIME_SECONDS, REFRESH_TOKEN_LIFETIME_SECONDS } from "../constants/auth";
import { User } from "@mini-erp/shared";

/**
 * Legge i cookies dal server
 */
export async function getCookiesString(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    const cookieParts: string[] = [];
    if (accessToken) cookieParts.push(`accessToken=${accessToken}`);
    if (refreshToken) cookieParts.push(`refreshToken=${refreshToken}`);

    return cookieParts.join("; ");
  } catch (error) {
    console.error("Failed to read cookies:", error);
    return "";
  }
}

/**
 * Get user from cookies server-side
 */
export async function getUserFromCookiesSSR(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user")?.value;

    if (!userCookie) {
      console.log("❌ No user cookie found");
      return null;
    }

    // Decodifica URL encoding prima di parsare JSON
    const decodedCookie = decodeURIComponent(userCookie);
    const user = JSON.parse(decodedCookie) as User;

    return user;
  } catch (error) {
    console.error("❌ Failed to parse user cookie:", error);
    return null;
  }
}

/**
 * Setta i cookies
 */
/**
 * Imposta i cookie di autenticazione (access token, refresh token, user, timestamp)
 */
export async function setCookies(
  accessToken: string,
  refreshToken: string,
  user: User,
): Promise<void> {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieStore = await cookies();

  // Access Token (httpOnly)
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    path: "/",
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_LIFETIME_SECONDS, // In secondi
  });

  // Refresh Token (httpOnly)
  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    path: "/",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_LIFETIME_SECONDS, // In secondi
  });

  // User Data (readable da JS)
  cookieStore.set("user", JSON.stringify(user), {
    httpOnly: false, // DEVE essere false
    secure: isProduction,
    path: "/",
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_LIFETIME_SECONDS, // Stessa durata del token
  });

  // Token Timestamp (readable da JS per proactive refresh)
  cookieStore.set("tokenTimestamp", String(Date.now()), {
    httpOnly: false, // DEVE essere false
    secure: isProduction,
    path: "/",
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_LIFETIME_SECONDS, // Stessa durata del token
  });
}

/**
 * Clears all authentication cookies.
 * Used to force logout when token refresh fails (e.g., Redis reset).
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("tokenTimestamp");
  cookieStore.delete("user");
}
