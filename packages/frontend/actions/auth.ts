// actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/server/api";
import { ServerApiError } from "@/types/server-client";
import { AuthResponse } from "@/types/api";
import { logoutUser } from "@/services/server/auth";
import { setCookies } from "@/lib/server/cookies";
import { LoginInput } from "@/types/user-types"

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Campi obbligatori mancanti" };

  try {
    // Tipizziamo la chiamata:
    const credentials: LoginInput = { email, password };

    // Output atteso: AuthResponse
    const data = await serverApi.post<AuthResponse>(
      "/auth/login",
      credentials
    );

    setCookies(data.accessToken, data.refreshToken, data.user);
  } catch (error) {
    if (error instanceof ServerApiError) {
      return { error: error.message };
    }
    return { error: "Errore di connessione al server" };
  }

  redirect("/dashboard");
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
