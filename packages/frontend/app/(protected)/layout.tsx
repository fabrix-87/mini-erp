"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { ShellBar } from "@/components/shell-bar";
import { SearchParamsProvider } from "@/providers/search-params-provider";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for protected application routes with fixed shell bar,
 * responsive sidebar, and a single scrollable content area.
 */
export default function ProtectedLayout({ children }: ProtectedLayoutProps): React.JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SearchParamsProvider>
      <div className="min-h-screen bg-muted/30">
        <ShellBar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((prev) => !prev)}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />

        <Sidebar
          mobileOpen={mobileOpen}
          collapsed={collapsed}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div
          className={cn(
            "pt-12 transition-[margin-left] duration-200",
            collapsed ? "lg:ml-16" : "lg:ml-64",
          )}
        >
          <main className="min-h-[calc(100vh-3rem)] overflow-x-hidden">
            <div className="px-4 py-4 lg:px-6 lg:py-5">{children}</div>
          </main>
        </div>
      </div>
    </SearchParamsProvider>
  );
}
