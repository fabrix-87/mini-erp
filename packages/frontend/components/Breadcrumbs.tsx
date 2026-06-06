// components/Breadcrumbs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBreadcrumbStoreData } from "@/hooks/use-breadcrumb";
import { actionLabels, entityLabels } from "@/lib/constants/breadcrumbs";
import { findPageTitle } from "@/helpers/breadcrumb-helper";
import { useEffect } from "react";

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a single processed segment of the breadcrumb trail.
 */
interface UnifiedCrumb {
  /** The text to be displayed in the UI */
  label: string;
  /** The target URL for the link. Optional for the last item */
  href: string;
}

/**
 * Breadcrumbs navigation component tailored for enterprise ERP applications.
 * * It resolves the trail dynamically using a two-tier architectural pattern:
 * 1. **Store Override (Priority 1):** Uses explicit labels injected via `useBreadcrumbSetter`
 * (e.g., entity names like "Mario Rossi"), validated against the current route to prevent flashing.
 * 2. **Automatic Fallback (Priority 2):** Parses the URL pathname segments against localized dictionaries
 * and structural side-navigation configs for all static pages.
 * * @component
 * @returns The rendered breadcrumb navigation bar, or null if on the landing roots.
 */
export function Breadcrumbs() {
  const currentPathname = usePathname();
  const { items: storeItems, pathname: storePathname } = useBreadcrumbStoreData();

  // Guard clause: Hide breadcrumbs on home/root dashboard areas
  if (currentPathname === "/" || currentPathname === "/dashboard") return null;

  // ── 1. UNIFIED DATA PROCESSING ────────────────────────────────────────────
  let finalCrumbs: UnifiedCrumb[] = [];

  // Verify if the store holds fresh data matching the active page layout
  const isStoreValid = storeItems.length > 0 && storePathname === currentPathname;

  if (isStoreValid) {
    // Map store items to match our unified structure safely
    finalCrumbs = storeItems.map((item) => ({
      label: item.label,
      href: item.href || currentPathname,
    }));
  } else {
    // Fallback: Generate structural breadcrumbs directly from the URL pathname segments
    const pathSegments = currentPathname.split("/").filter(Boolean);

    if (!(pathSegments.length === 1 && pathSegments[0] === "dashboard")) {
      finalCrumbs = pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join("/")}`;

        // Robust dynamic identifier parsing: check if the parent segment is a registered entity root
        const parentSegment = index > 0 ? pathSegments[index - 1] : null;
        const isDynamicId = parentSegment && entityLabels[parentSegment];

        let label = segment;
        const structuralTitle = findPageTitle(href);

        if (structuralTitle) {
          label = structuralTitle;
        } else if (actionLabels[segment]) {
          label = actionLabels[segment];
        } else if (isDynamicId) {
          // Handles numerical IDs, UUIDs, and custom strings gracefully by cropping long hashes
          const formattedId = segment.length > 12 ? segment.slice(0, 8) + "..." : segment;
          label = `${entityLabels[parentSegment]} #${formattedId}`;
        } else {
          // General semantic fallback for non-registered static segments
          label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
        }

        return { label, href };
      });
    }
  }

  // If no segments could be calculated, prevent empty rendering wrapper
  if (finalCrumbs.length === 0) return null;

  // ── SINCRONIZZAZIONE DEL TITOLO DEL BROWSER ────────────────────────
  // Estraiamo l'ultimo elemento calcolato (che sia da store o da fallback)
  const lastCrumbLabel = finalCrumbs.at(-1)?.label;

  useEffect(() => {
    const baseTitle = process.env.NEXT_PUBLIC_APP_NAME ?? "MyERP - Gestionale Aziendale";
    document.title = lastCrumbLabel ? `${lastCrumbLabel} | ${baseTitle}` : baseTitle;
  }, [lastCrumbLabel]); // Si attiva solo se il testo dell'ultimo breadcrumb cambia effettivamente

  // ── 2. UNIFIED UI RENDERING (DRY) ─────────────────────────────────────────
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
