// actions/auth-actions.ts
"use server";

import { redirect } from "next/navigation";
import { ServerApiError } from "@/types/server-client";
import { AuthResponse } from "@/types/api";
import { logoutUser } from "@/services/server/auth-service";
import { forwardTokenCookiesFromResponse, setCookies } from "@/lib/server/cookies";
import { LoginInput } from "@/types/user-types";
import { API_BASE_URL } from "@/lib/server/api";
import { clearAuthCookies } from "@/helpers/auth-cookie-helper";

// ============================================================================
// Types
// ============================================================================

interface ActionResult {
  success?: boolean;
  error?: string;
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Authenticates a user with email and password.
 *
 * Forwards the browser fingerprint via `X-Device-Fingerprint` header so the
 * backend stores it in the JWT — ensuring the same fingerprint is used during
 * subsequent token refreshes.
 *
 * On success, sets `user` and `tokenTimestamp` cookies client-side.
 * Access and refresh tokens are set as HttpOnly cookies directly by the backend
 * and forwarded via {@link forwardTokenCookiesFromResponse}.
 *
 * @param prevState - Previous form state (required by `useActionState`).
 * @param formData - Form data containing `email`, `password`, and `fingerprint`.
 */
export async function loginAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fingerprint = formData.get("fingerprint") as string;

  if (!email || !password) {
    return { error: "Campi obbligatori mancanti" };
  }

  try {
    const credentials: LoginInput = { email, password };

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Use the browser fingerprint — NOT getFingerprintForSSR() — so that
        // the JWT is bound to the same fingerprint the browser sends at refresh time.
        "X-Device-Fingerprint": fingerprint,
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const err = await response.json();
      return { error: err.message || "Credenziali non valide" };
    }

    const json = await response.json();
    const data: AuthResponse = json.data;

    // Forward HttpOnly token cookies from backend Set-Cookie headers
    await forwardTokenCookiesFromResponse(response);

    // Set non-sensitive client-readable cookies (user payload, token timestamp)
    await setCookies(data.user);

    return { success: true };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return { error: error.message };
    }
    return { error: "Errore di connessione al server" };
  }
}

/**
 * Logs out the current user.
 *
 * Notifies the backend (best-effort), clears all auth cookies from the
 * server-side cookie store, then redirects to the login page.
 *
 * NOTE: The device fingerprint cookie (`device-fp`) is intentionally preserved
 * as it identifies the device, not the user session.
 */
export async function logoutAction(): Promise<void> {
  // Best-effort backend notification (invalidates Redis session)
  await logoutUser();

  // Clear all auth cookies (accessToken, refreshToken, user, tokenTimestamp)
  await clearAuthCookies();

  redirect("/login");
}
