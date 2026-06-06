// components/CrmLayout.tsx
"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { Breadcrumbs } from "./breadcrumbs";

interface CrmLayoutProps {
  children: ReactNode;
}

export function CrmLayout({ children }: CrmLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-sidebar-background">
      {/* Sidebar vive sullo sfondo base */}
      <Sidebar sidebarOpen={sidebarOpen} onSidebarClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Container Principale: Questo crea l'effetto "foglio" bianco stile Gmail */}
        <div className="flex-1 overflow-hidden p-2 lg:p-4 pt-0">
          <main className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:ring-white/5">
            {/* Header interno al foglio (Breadcrumbs) */}
            <Breadcrumbs />
            {/* Contenuto scrollabile */}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
