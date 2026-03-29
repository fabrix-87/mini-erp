// components/Breadcrumbs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { navigationConfig, NavigationItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useBreadcrumbItems } from "@/hooks/use-breadcrumb";

// ============================================================================
// Constants
// ============================================================================

const actionLabels: Record<string, string> = {
  new: "Nuovo",
  edit: "Modifica",
  create: "Crea",
  update: "Aggiorna",
  view: "Visualizza",
  calendar: "Calendario",
  stats: "Statistiche",
  settings: "Impostazioni",
  profile: "Profilo",
  general: "Generali",
  users: "Utenti",
  roles: "Ruoli",
};

const entityLabels: Record<string, string> = {
  activities: "Attività",
  customers: "Cliente",
  suppliers: "Fornitore",
  contacts: "Contatto",
  leads: "Lead",
  products: "Prodotto",
  orders: "Ordine",
  quotes: "Preventivo",
  invoices: "Fattura",
  payments: "Pagamento",
  warehouses: "Magazzino",
  inventory: "Articolo",
  users: "Utente",
  roles: "Ruolo",
};

// ============================================================================
// Helpers (invariati)
// ============================================================================

interface BreadcrumbSegment {
  name: string;
  href: string;
  isLast?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function Breadcrumbs() {
  const pathname = usePathname();

  // ── Priorità 1: items strutturati dallo store ─────────────────────────────
  const storeItems = useBreadcrumbItems();

  if (pathname === "/" || pathname === "/dashboard") return null;

  // Se lo store ha items, li usiamo direttamente — nessuna logica pathname
  if (storeItems.length > 0) {
    return (
      <div className="bg-card border-b border-border px-6 py-4">
        <nav className="flex items-center space-x-2 text-sm">
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

          {storeItems.map((item, i) => {
            const isLast = i === storeItems.length - 1;
            return (
              <div key={i} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "px-2 py-1 rounded-md transition-colors",
                      "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground px-2 py-1">{item.label}</span>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    );
  }

  // ── Priorità 2: fallback automatico da pathname (logica esistente) ─────────
  const pathSegments = pathname.split("/").filter(Boolean);
  if (pathSegments.length === 1 && pathSegments[0] === "dashboard") return null;

  const findItemRecursive = (items: NavigationItem[], href: string): NavigationItem | null => {
    for (const item of items) {
      if (item.href === href) return item;
      if (item.items) {
        const found = findItemRecursive(item.items, href);
        if (found) return found;
      }
    }
    return null;
  };

  const findPageTitle = (href: string): string => {
    for (const section of navigationConfig) {
      const item = findItemRecursive(section.items, href);
      if (item) return item.name;
    }
    return "";
  };

  const isNumericId = (segment: string) => /^\d+$/.test(segment);

  const getEntityName = (index: number): string => {
    if (index > 0) {
      const parent = pathSegments[index - 1];
      return entityLabels[parent] || "Dettaglio";
    }
    return "Dettaglio";
  };

  const getSegmentLabel = (segment: string, index: number, href: string): string => {
    const navTitle = findPageTitle(href);
    if (navTitle) return navTitle;
    if (actionLabels[segment]) return actionLabels[segment];
    if (isNumericId(segment)) return `${getEntityName(index)} #${segment}`;
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  };

  const breadcrumbs: BreadcrumbSegment[] = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    return {
      name: getSegmentLabel(segment, index, href),
      href,
      isLast: index === pathSegments.length - 1,
    };
  });

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <nav className="flex items-center space-x-2 text-sm">
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

        {breadcrumbs.map((crumb) => (
          <div key={crumb.href} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            {crumb.isLast ? (
              <span className="font-medium text-foreground px-2 py-1">{crumb.name}</span>
            ) : (
              <Link
                href={crumb.href}
                className={cn(
                  "px-2 py-1 rounded-md transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                {crumb.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
