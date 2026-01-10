// context/BreadcrumbContext.tsx
"use client";

import { createContext, useContext } from "react";

interface BreadcrumbContextType {
  customTitles: Record<string, string>;
  setCustomTitle: (path: string, title: string) => void;
  clearCustomTitle: (path: string) => void;
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

export const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
);

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
  }
  return context;
}
