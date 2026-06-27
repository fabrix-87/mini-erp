import { COOKIE_NAMES } from "@/types/cookie-types";
import { cookies } from "next/headers";

/**
 * Deletes all authentication cookies from the server-side cookie store.
 * Used during logout or when a token refresh fails unrecoverably.
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  Object.values(COOKIE_NAMES).forEach((name) => cookieStore.delete(name));
}
