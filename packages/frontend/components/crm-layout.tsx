// components/crm-layout.tsx
"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { Breadcrumbs } from "./breadcrumbs";
import { SearchParamsProvider } from "@/providers/search-params-provider";
import { useAuth } from "@/hooks/use-auth";
import { AppSkeleton } from "./app-skeleton";

interface CrmLayoutProps {
  children: ReactNode;
}

export function CrmLayout({ children }: CrmLayoutProps) {
  const { isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mostra il full-layout skeleton finché i dati utente non sono pronti
  if (isLoading) return <AppSkeleton />;

  return (
    <SearchParamsProvider>
      <div className="flex h-screen overflow-hidden bg-sidebar-background">
        <Sidebar sidebarOpen={sidebarOpen} onSidebarClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <div className="flex-1 overflow-hidden p-2 lg:p-4 pt-0">
            <main className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:ring-white/5">
              <Breadcrumbs />
              <div className="flex-1 overflow-y-auto p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </SearchParamsProvider>
  );
}