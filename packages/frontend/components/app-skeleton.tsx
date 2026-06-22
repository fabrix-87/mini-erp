// components/app-skeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// ============================================================================
// Sidebar Skeleton
// ============================================================================

/**
 * Mirrors the real Sidebar layout:
 * logo area → nav sections with items → user menu footer.
 */
function SidebarSkeleton() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
        <Skeleton className="h-4 w-28" />
      </div>

      <Separator />

      {/* Nav sections */}
      <nav className="flex-1 overflow-hidden px-3 py-4 space-y-6">
        {/* Section 1 — 4 items */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-20 mx-3 mb-3" />
          {[32, 24, 28, 20].map((w, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="h-5 w-5 rounded-md shrink-0" />
              <Skeleton className={`h-4 w-${w}`} />
            </div>
          ))}
        </div>

        {/* Section 2 — 3 items */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-16 mx-3 mb-3" />
          {[28, 20, 24].map((w, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="h-5 w-5 rounded-md shrink-0" />
              <Skeleton className={`h-4 w-${w}`} />
            </div>
          ))}
        </div>
      </nav>

      <Separator />

      {/* User footer */}
      <div className="p-4">
        <div className="flex items-center gap-3 px-2 py-1">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    </aside>
  );
}

// ============================================================================
// Navbar Skeleton
// ============================================================================

/**
 * Mirrors the real Navbar layout:
 * search bar → theme toggle + notification icons.
 */
function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-transparent px-4 py-2">
      <div className="flex-1 max-w-3xl">
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
      <div className="flex items-center gap-1 pl-2">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      </div>
    </header>
  );
}

// ============================================================================
// Content Skeleton
// ============================================================================

/**
 * Mirrors the main content area inside the "foglio" card:
 * breadcrumb bar → page header → toolbar → table rows.
 */
function ContentSkeleton() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-6 py-3">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3.5 w-24" />
      </div>

      <Separator />

      <div className="flex-1 overflow-hidden p-6 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-6 px-4 py-3 bg-muted/40">
            <Skeleton className="h-3.5 w-10" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-14" />
          </div>
          <Separator />
          {/* Rows */}
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-center gap-6 px-4 py-3.5">
                <Skeleton className="h-4 w-10 shrink-0" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              {i < 6 && <Separator />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// AppSkeleton — full layout
// ============================================================================

/**
 * Full-layout skeleton that mirrors CrmLayout structure exactly.
 * Used as loading state in CrmLayout while AuthProvider resolves user data.
 * Composes SidebarSkeleton + NavbarSkeleton + ContentSkeleton.
 */
export function AppSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-sidebar-background">
      <SidebarSkeleton />

      <div className="flex flex-1 flex-col overflow-hidden">
        <NavbarSkeleton />

        <div className="flex-1 overflow-hidden p-2 lg:p-4 pt-0">
          <main className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:ring-white/5">
            <ContentSkeleton />
          </main>
        </div>
      </div>
    </div>
  );
}
