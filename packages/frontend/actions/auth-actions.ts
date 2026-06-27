// actions/auth-actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ServerApiError } from "@/types/server-client";
import { AuthResponse } from "@/types/api";
import { logoutUser } from "@/services/server/auth";
import { forwardTokenCookiesFromResponse, setCookies } from "@/lib/server/cookies";
import { LoginInput } from "@/types/user-types";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fingerprint = formData.get("fingerprint") as string;

  if (!email || !password) return { error: "Campi obbligatori mancanti" };

  try {
    // Tipizziamo la chiamata:
    const credentials: LoginInput = { email, password };

    // Output atteso: AuthResponse
    const response = await fetch(`${(await import("@/lib/server/api")).API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Device-Fingerprint": fingerprint },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const err = await response.json();
      return { error: err.message || "Credenziali non valide" };
    }

    const json = await response.json();
    const data: AuthResponse = json.data;

    // Forward tokens from Set-Cookie headers to the browser
    await forwardTokenCookiesFromResponse(response);

    // Setta solo i cookie non sensibili (user, tokenTimestamp)
    await setCookies(data.user);

    return { success: true };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return { error: error.message };
    }
    return { error: "Errore di connessione al server" };
  }
}

export async function logoutAction() {
  // 1. Notifica il backend (Best effort)
  await logoutUser();

  // 2. Pulisci i cookie di sessione
  const cookieStore = await cookies();

  // .delete è il metodo sicuro di Next.js per rimuovere i cookie
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("user");

  // Nota: NON si cancella il fingerprint ('device-fp')
  // perché identifica il dispositivo, non la sessione utente.

  // 3. Redirect alla login
  redirect("/login");
}
