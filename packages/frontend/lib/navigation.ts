// lib/navigation.ts
import { useMemo } from "react";
import {
  Home,
  PhoneCall,
  Users,
  Package,
  Upload,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  SunMoon,
  Calendar,
  Files,
  UserCheck,
  Building2,
  TrendingUp,
  FileText,
  ShoppingCart,
  Package2,
  Warehouse,
  Receipt,
  CreditCard,
  Percent,
  FileSpreadsheet,
  FileCheck,
  FileMinus,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NavigationItem, NavigationSection } from "@/types/navigation-types";

// ============================================================================
// Configuration
// ============================================================================

export const navigationConfig: NavigationSection[] = [
  {
    title: "Panoramica",
    path: "/dashboard",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
        description: "Panoramica generale e KPI",
      },
      {
        name: "Attività",
        href: "/activities",
        icon: Calendar,
        description: "Calendario e task",
        items: [
          { name: "Lista", href: "/activities" },
          { name: "Calendario", href: "/activities/calendar" },
          { name: "Nuova Attività", href: "/activities/new" },
        ],
      },
      {
        name: "Report",
        href: "/reports",
        icon: BarChart3,
        description: "Analisi e statistiche",
      },
    ],
  },
  {
    title: "CRM",
    path: "/crm",
    items: [
      { name: "Leads", href: "/leads", icon: PhoneCall, description: "Gestione opportunità" },
      { name: "Clienti", href: "/customers", icon: UserCheck, description: "Anagrafica clienti" },
      { name: "Contatti", href: "/contacts", icon: Users, description: "Rubrica contatti" },
    ],
  },
  {
    title: "Vendite",
    path: "/sales",
    items: [
      { name: "Preventivi", href: "/sales/quotes", icon: FileText, description: "Preventivi e offerte" },
      { name: "Ordini", href: "/sales/orders", icon: ShoppingCart, description: "Ordini clienti" },
      { name: "Prodotti", href: "/sales/products", icon: Package, description: "Catalogo prodotti" },
    ],
  },
  {
    title: "Acquisti",
    path: "/purchasing",
    items: [
      { name: "Fornitori", href: "/suppliers", icon: Building2, description: "Anagrafica fornitori" },
      { name: "Ordini Fornitori", href: "/purchasing/orders", icon: ShoppingCart, description: "Ordini d'acquisto" },
    ],
  },
  {
    title: "Magazzino",
    path: "/warehouse",
    items: [
      { name: "Magazzini", href: "/warehouses", icon: Warehouse, description: "Gestione magazzini" },
      { name: "Inventario", href: "/inventory", icon: Package2, description: "Giacenze e movimenti" },
    ],
  },
  {
    title: "Amministrazione",
    path: "/administration",
    items: [
      { name: "Bolle", href: "/administration/delivery-notes", icon: FileCheck, description: "Documenti di trasporto" },
      { name: "Fatture", href: "/administration/invoices", icon: Receipt, description: "Fatture attive e passive" },
      { name: "Note di Credito", href: "/administration/credit-notes", icon: FileMinus, description: "Note di credito" },
      { name: "Pagamenti", href: "/administration/payments", icon: CreditCard, description: "Gestione pagamenti" },
      { name: "Tasse", href: "/administration/taxes", icon: Percent, description: "Aliquote e imposte" },
    ],
  },
  {
    title: "Configurazione",
    path: "/settings",
    items: [
      { name: "Utenti", href: "/settings/users", icon: UserCog, roles: ["ADMIN"], description: "Gestione utenti" },
      { name: "Ruoli", href: "/settings/roles", icon: ShieldCheck, roles: ["ADMIN"], description: "Ruoli e permessi" },
      { name: "Impostazioni", href: "/settings/general", icon: Settings, description: "Configurazioni generali" },
    ],
  },
];

// ============================================================================
// RBAC Core Logic Helpers
// ============================================================================

/**
 * Recursively filters navigation items matching the allowed user roles.
 * Optimized via Set lookups to achieve O(1) checks per item role.
 * * @param items - Tree array of navigation targets.
 * @param userRoleCodes - Set containing the active user's authorized role codes.
 * @returns Filtered hierarchy array compliant with security constraints.
 */
function filterItemsByRoles(
  items: NavigationItem[],
  userRoleCodes: Set<string>
): NavigationItem[] {
  return items
    .filter((item) => {
      // If no roles specified, grant public access within the ERP session
      if (!item.roles) return true;
      return item.roles.some((role) => userRoleCodes.has(role));
    })
    .map((item) => {
      if (item.items && item.items.length > 0) {
        return {
          ...item,
          items: filterItemsByRoles(item.items, userRoleCodes),
        };
      }
      return item;
    });
}

// ============================================================================
// Public Hooks & Utilities
// ============================================================================

/**
 * Custom hook providing a role-filtered navigation structure optimized via memoization.
 * * @returns Secured layout navigation config array matching user credentials.
 */
export function useFilteredNavigation() {
  const { user } = useAuth();

  return useMemo(() => {
    // 1. Forziamo il Set a essere di tipo string
    // 2. Usiamo 'as string' sul map per blindare il tipo anche se user è parzialmente tipizzato
    const userRoleCodes = new Set<string>(
      user?.roles?.map((r: any) => r.code as string) || []
    );

    return navigationConfig
      .map((section) => ({
        ...section,
        items: filterItemsByRoles(section.items, userRoleCodes),
      }))
      .filter((section) => section.items.length > 0);
  }, [user?.roles]);
}

/**
 * Determines if a specific link matches exactly the active browser path.
 * * @param currentPath - The current usePathname() token.
 * @param href - Target link destination.
 * @returns Truthy boolean flags stating active linkage state.
 */
export function isActiveLink(currentPath: string, href: string): boolean {
  return currentPath === href;
}

/**
 * Safely verifies if a generic sidebar sidebar section is an active prefix layout.
 * Fixed to prevent overlapping conflicts (e.g., /sales matching false-positive /sales-tax pages).
 * * @param currentPath - Active window location pathname.
 * @param sectionPath - Declared navigation sidebar module section folder root path.
 * @returns Verified structural state.
 */
export function isActiveSection(currentPath: string, sectionPath: string): boolean {
  if (sectionPath === "/dashboard") {
    return currentPath === sectionPath;
  }
  // Standard strict match or secure folder sub-routing traversal boundary delimiter check
  return currentPath === sectionPath || currentPath.startsWith(`${sectionPath}/`);
}

/**
 * Asserts if any child nodes under a collapsible layout folder route are currently selected.
 * * @param currentPath - Active browser location URL pathname.
 * @param items - Internal nested sublinks array configuration.
 * @returns Evaluation flag state.
 */
export function hasActiveSubItem(currentPath: string, items?: NavigationItem[]): boolean {
  if (!items || items.length === 0) return false;
  return items.some((subItem) => currentPath === subItem.href);
}

/**
 * Bundled iconography records mapping global navigation toolbar headers safely.
 */
export const headerIcons = {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  Settings,
  LogOut,
  SunMoon,
};