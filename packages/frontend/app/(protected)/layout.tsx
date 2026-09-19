"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { ShellBar } from "@/components/shell-bar";
import { SearchParamsProvider } from "@/providers/search-params-provider";
import { TooltipProvider } from "@radix-ui/react-tooltip";

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
      <TooltipProvider>
        <div className="flex min-h-screen w-full">
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
              "min-w-0 flex-1 pt-12 pr-4 transition-[margin-left] duration-200",
              collapsed ? "lg:ml-16" : "lg:ml-64",
            )}
          >
            <main className="min-w-0 min-h-[calc(100vh-3rem)] overflow-x-hidden">
              <div
                className={cn(
                  "min-w-0 w-full px-4 py-4 lg:px-6 lg:py-5",
                  "rounded-2xl bg-secondary p-(--gap) dark:bg-background *:[div]:gap-(--gap)",
                )}
              >
                {children}
              </div>
            </main>
          </div>
        </div>
      </TooltipProvider>
    </SearchParamsProvider>
  );
}
