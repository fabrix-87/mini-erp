// components/Breadcrumbs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { navigationConfig, NavigationItem } from "@/lib/navigation";

import { cn } from "@/lib/utils";
import { useBreadcrumb } from "@/app/context/breadcrumb-context";

interface BreadcrumbSegment {
  name: string;
  href: string;
  isLast?: boolean;
}

// Mappa delle label comuni per azioni CRUD
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

// Mappa dei plurali -> singolari per titoli
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

export function Breadcrumbs() {
  const pathname = usePathname();
  const { customTitles } = useBreadcrumb();

  // Non mostrare breadcrumb per dashboard o root
  if (pathname === "/" || pathname === "/dashboard") {
    return null;
  }

  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments.length === 1 && pathSegments[0] === "dashboard") {
    return null;
  }

  // Funzione ricorsiva per cercare item nei sub-items
  const findItemRecursive = (
    items: NavigationItem[],
    href: string
  ): NavigationItem | null => {
    for (const item of items) {
      if (item.href === href) return item;
      if (item.items) {
        const found = findItemRecursive(item.items, href);
        if (found) return found;
      }
    }
    return null;
  };

  // Trova il titolo della pagina dalla navigazione
  const findPageTitle = (href: string): string => {
    for (const section of navigationConfig) {
      const item = findItemRecursive(section.items, href);
      if (item) return item.name;
    }
    return "";
  };

  // Determina se un segmento è un ID numerico
  const isNumericId = (segment: string): boolean => {
    return /^\d+$/.test(segment);
  };

  // Ottieni il nome dell'entità dal segmento precedente
  const getEntityName = (index: number): string => {
    if (index > 0) {
      const parentSegment = pathSegments[index - 1];
      return entityLabels[parentSegment] || "Dettaglio";
    }
    return "Dettaglio";
  };

  // Genera label leggibile per un segmento
  const getSegmentLabel = (
    segment: string,
    index: number,
    href: string
  ): string => {
    // 1. Controlla se c'è un titolo custom dal Context
    if (customTitles[href]) {
      return customTitles[href];
    }

    // 2. Controlla nella navigationConfig
    const navTitle = findPageTitle(href);
    if (navTitle) return navTitle;

    // 3. Controlla se è un'azione CRUD comune
    if (actionLabels[segment]) {
      return actionLabels[segment];
    }

    // 4. Se è un ID numerico, mostra il nome dell'entità
    if (isNumericId(segment)) {
      return `${getEntityName(index)} #${segment}`;
    }

    // 5. Capitalizza il segmento come fallback
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  };

  // Costruisci i breadcrumbs
  const breadcrumbs: BreadcrumbSegment[] = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const name = getSegmentLabel(segment, index, href);
    const isLast = index === pathSegments.length - 1;

    return { name, href, isLast };
  });

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <nav className="flex items-center space-x-2 text-sm">
        {/* Home Link */}
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>

        {/* Breadcrumb Items */}
        {breadcrumbs.map((crumb) => (
          <div key={crumb.href} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            {crumb.isLast ? (
              <span className="font-medium text-foreground px-2 py-1">
                {crumb.name}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className={cn(
                  "px-2 py-1 rounded-md transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-accent"
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
