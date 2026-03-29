// providers/breadcrumb-provider.tsx
import { BreadcrumbContext } from "@/app/context/breadcrumb-context";
import { ReactNode, useEffect } from "react";

import { breadcrumbStore } from "@/lib/stores/breadcrumb-store";

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const baseTitle = process.env.NEXT_PUBLIC_APP_NAME ?? "MyERP - Gestionale Aziendale";

  useEffect(() => {
    // Aggiorna document.title ogni volta che lo store cambia
    const unsub = breadcrumbStore.subscribe(() => {
      const items = breadcrumbStore.getSnapshot().items;
      const last = items.at(-1);
      document.title = last?.label ? `${last.label} | ${baseTitle}` : baseTitle;
    });
    return unsub;
  }, [baseTitle]);

  return (
    <BreadcrumbContext.Provider
      value={{
        customTitles: {}, // ← stub vuoto, non più usato
        setCustomTitle: () => {}, // ← stub
        clearCustomTitle: () => {}, // ← stub
        pageTitle: "", // ← stub
        setPageTitle: () => {}, // ← stub
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
}
