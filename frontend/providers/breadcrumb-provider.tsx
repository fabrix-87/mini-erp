import { BreadcrumbContext } from "@/app/context/breadcrumb-context";
import { ReactNode, useCallback, useEffect, useState } from "react";

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const baseTitle = process.env.APP_NAME || "MyERP - Gestionale Aziendale";
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({});
  const [pageTitle, setPageTitleState] = useState<string>(baseTitle);

  const setCustomTitle = useCallback((path: string, title: string) => {
    setCustomTitles((prev) => ({ ...prev, [path]: title }));
  }, []);

  const clearCustomTitle = useCallback((path: string) => {
    setCustomTitles((prev) => {
      const newTitles = { ...prev };
      delete newTitles[path];
      return newTitles;
    });
  }, []);

  const setPageTitle = useCallback((title: string) => {
    setPageTitleState(title);
  }, []);

  // Aggiorna il document.title quando cambia pageTitle
  useEffect(() => {
    document.title =
      pageTitle && pageTitle !== baseTitle
        ? `${pageTitle} | ${baseTitle}`
        : baseTitle;
  }, [pageTitle]);

  return (
    <BreadcrumbContext.Provider
      value={{
        customTitles,
        setCustomTitle,
        clearCustomTitle,
        pageTitle,
        setPageTitle,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
}
