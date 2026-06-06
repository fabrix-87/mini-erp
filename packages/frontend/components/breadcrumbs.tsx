// components/breadcrumbs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActionLabels, useBreadcrumbStoreData, useEntityLabels } from "@/hooks/use-breadcrumb";
import { useFindPageTitle } from "@/helpers/breadcrumb-helper";
import { useEffect, useMemo } from "react";
import { SECTION_PATHS } from "@/lib/navigation-config";

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a single processed segment of the breadcrumb trail.
 */
interface UnifiedCrumb {
  /** The text to be displayed in the UI */
  label: string;
  /** The target URL for the link */
  href: string;
}

/**
 * Breadcrumbs navigation component tailored for enterprise ERP applications.
 *
 * Resolves the trail dynamically using a two-tier pattern:
 * 1. **Store Override (Priority 1):** Explicit labels injected via `useBreadcrumbSetter`
 * 2. **Automatic Fallback (Priority 2):** Parses URL segments against localized dictionaries
 *
 * @component
 * @returns The rendered breadcrumb navigation bar, or null if on the landing roots.
 */
export function Breadcrumbs() {
  // ── ALL HOOKS FIRST — no exceptions ───────────────────────────────────────
  const currentPathname = usePathname();
  const { items: storeItems, pathname: storePathname } = useBreadcrumbStoreData();
  const findPageTitle = useFindPageTitle();
  const actionLabels = useActionLabels();
  const entityLabels = useEntityLabels();

  const finalCrumbs = useMemo<UnifiedCrumb[]>(() => {
    // Guard: no crumbs on root pages
    if (currentPathname === "/" || currentPathname === "/dashboard") return [];

    // Priority 1: store data valid for the current route
    const isStoreValid = storeItems.length > 0 && storePathname === currentPathname;
    if (isStoreValid) {
      return storeItems.map((item) => ({
        label: item.label,
        href: item.href || currentPathname,
      }));
    }

    // Priority 2: fallback from URL segments
    const pathSegments = currentPathname.split("/").filter(Boolean);
    if (pathSegments.length === 1 && pathSegments[0] === "dashboard") return [];

    return pathSegments.map((segment, index) => {
      const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
      const parentSegment = index > 0 ? pathSegments[index - 1] : null;
      const isDynamicId = parentSegment && entityLabels[parentSegment];

      const structuralTitle = findPageTitle(href); // ← ora è una chiamata pura, non un hook

      let label: string;
      if (structuralTitle) {
        label = structuralTitle;
      } else if (actionLabels[segment]) {
        label = actionLabels[segment];
      } else if (isDynamicId) {
        const formattedId = segment.length > 12 ? segment.slice(0, 8) + "..." : segment;
        label = `${entityLabels[parentSegment]} #${formattedId}`;
      } else {
        label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      }

      return { label, href };
    })
    .filter((crumb) => !SECTION_PATHS.has(crumb.href));
  }, [currentPathname, storeItems, storePathname, findPageTitle]);

  // ── SINCRONIZZAZIONE DEL TITOLO DEL BROWSER ────────────────────────
  // Estraiamo l'ultimo elemento calcolato (che sia da store o da fallback)
  const lastCrumbLabel = finalCrumbs.at(-1)?.label;

  useEffect(() => {
    if (!lastCrumbLabel) return;

    // Only override title on dynamic detail/edit routes (e.g. /crm/customers/123, /crm/customers/123/edit)
    // Static routes (e.g. /crm/customers) are handled by generateMetadata in their page.tsx
    const hasDynamicSegment = currentPathname
      .split("/")
      .filter(Boolean)
      .some((segment) => !isNaN(Number(segment)) || /^[0-9a-f-]{8,}$/i.test(segment));

    if (!hasDynamicSegment) return;

    const baseTitle = process.env.NEXT_PUBLIC_APP_NAME ?? "MyERP - Gestionale Aziendale";
    document.title = `${lastCrumbLabel} | ${baseTitle}`;
  }, [lastCrumbLabel, currentPathname]);

  // ── CONDITIONAL RENDER — solo dopo tutti gli hook ─────────────────────────
  if (finalCrumbs.length === 0) return null;

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-accent",
          )}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>

        {finalCrumbs.map((crumb, i) => {
          const isLast = i === finalCrumbs.length - 1;
          return (
            <div key={`${crumb.href}-${i}`} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              {isLast ? (
                <span className="font-medium text-foreground px-2 py-1" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className={cn(
                    "px-2 py-1 rounded-md transition-colors",
                    "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
