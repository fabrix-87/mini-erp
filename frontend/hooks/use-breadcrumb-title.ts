// hooks/use-breadcrumb-title.ts
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useBreadcrumb } from "@/app/context/breadcrumb-context";

export function useBreadcrumbTitle(title: string | undefined) {
  const pathname = usePathname();
  const { setCustomTitle, clearCustomTitle, setPageTitle } = useBreadcrumb();

  useEffect(() => {
    if (title) {
      // Imposta sia il breadcrumb che il page title
      setCustomTitle(pathname, title);
      setPageTitle(title);
    }

    return () => {
      clearCustomTitle(pathname);
      // Resetta il page title al default quando si smonta
      setPageTitle("");
    };
  }, [pathname, title, setCustomTitle, clearCustomTitle, setPageTitle]);
}