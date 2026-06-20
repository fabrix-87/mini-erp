// app/actions.ts
"use server";

import { ActionResult, withAuth } from "@/lib/server/action";
import { revalidatePath } from "next/cache";

export async function purgeAllCache(): Promise<ActionResult> {
  const isDev = process.env.NODE_ENV === "development";

  // Esempio di logica di protezione
  if (isDev) {
    const result = await withAuth(
      async () => {
        // Invalida l'intero albero dell'applicazione (tutti i path e layout)
        revalidatePath("/", "layout");

        return { success: true, message: "Cache globale svuotata con successo!" };
      },
      undefined,
      "ADMIN",
    );
    return result.success
      ? result
      : { success: false, message: "Errore durante lo svuotamento della cache:" };
  }else{
    return { success: false, message: "Svuotamento cache richiesto in ambiente DEVELOPMENT" }
  }
}
