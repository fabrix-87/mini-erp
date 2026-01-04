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

export interface NavigationItem {
  name: string;
  href: string;
  icon?: any;
  roles?: string[];
  badge?: string | number;
  description?: string;
  items?: NavigationItem[];
}

export interface NavigationSection {
  title: string;
  path: string;
  items: NavigationItem[];
}

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
          {
            name: "Lista",
            href: "/activities",
          },
          {
            name: "Calendario",
            href: "/activities/calendar",
          },
          {
            name: "Nuova Attività",
            href: "/activities/new",
          },
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
      {
        name: "Leads",
        href: "/leads",
        icon: PhoneCall,
        description: "Gestione opportunità",
      },
      {
        name: "Clienti",
        href: "/customers",
        icon: UserCheck,
        description: "Anagrafica clienti",
      },
      {
        name: "Contatti",
        href: "/contacts",
        icon: Users,
        description: "Rubrica contatti",
      },
    ],
  },
  {
    title: "Vendite",
    path: "/sales",
    items: [
      {
        name: "Preventivi",
        href: "/sales/quotes",
        icon: FileText,
        description: "Preventivi e offerte",
      },
      {
        name: "Ordini",
        href: "/sales/orders",
        icon: ShoppingCart,
        description: "Ordini clienti",
      },
      {
        name: "Prodotti",
        href: "/sales/products",
        icon: Package,
        description: "Catalogo prodotti",
      },
    ],
  },
  {
    title: "Acquisti",
    path: "/purchasing",
    items: [
      {
        name: "Fornitori",
        href: "/suppliers",
        icon: Building2,
        description: "Anagrafica fornitori",
      },
      {
        name: "Ordini Fornitori",
        href: "/purchasing/orders",
        icon: ShoppingCart,
        description: "Ordini d'acquisto",
      },
    ],
  },
  {
    title: "Magazzino",
    path: "/warehouse",
    items: [
      {
        name: "Magazzini",
        href: "/warehouses",
        icon: Warehouse,
        description: "Gestione magazzini",
      },
      {
        name: "Inventario",
        href: "/inventory",
        icon: Package2,
        description: "Giacenze e movimenti",
      },
    ],
  },
  {
    title: "Amministrazione",
    path: "/administration",
    items: [
      {
        name: "Bolle",
        href: "/administration/delivery-notes",
        icon: FileCheck,
        description: "Documenti di trasporto",
      },
      {
        name: "Fatture",
        href: "/administration/invoices",
        icon: Receipt,
        description: "Fatture attive e passive",
      },
      {
        name: "Note di Credito",
        href: "/administration/credit-notes",
        icon: FileMinus,
        description: "Note di credito",
      },
      {
        name: "Pagamenti",
        href: "/administration/payments",
        icon: CreditCard,
        description: "Gestione pagamenti",
      },
      {
        name: "Tasse",
        href: "/administration/taxes",
        icon: Percent,
        description: "Aliquote e imposte",
      },
    ],
  },
  {
    title: "Configurazione",
    path: "/settings",
    items: [
      {
        name: "Utenti",
        href: "/settings/users",
        icon: UserCog,
        roles: ["ADMIN"],
        description: "Gestione utenti",
      },
      {
        name: "Ruoli",
        href: "/settings/roles",
        icon: ShieldCheck,
        roles: ["ADMIN"],
        description: "Ruoli e permessi",
      },
      {
        name: "Impostazioni",
        href: "/settings/general",
        icon: Settings,
        description: "Configurazioni generali",
      },
    ],
  },
];

// Funzione ricorsiva per filtrare items in base ai ruoli
function filterItemsByRoles(
  items: NavigationItem[],
  userRoles?: { code: string }[]
): NavigationItem[] {
  return items
    .filter((item) => {
      // Controlla se l'utente ha i ruoli necessari
      const hasAccess =
        !item.roles ||
        (userRoles &&
          item.roles.some((role) =>
            userRoles.some((userRole) => userRole.code === role)
          ));

      return hasAccess;
    })
    .map((item) => {
      // Se l'item ha sotto-items, filtrali ricorsivamente
      if (item.items && item.items.length > 0) {
        return {
          ...item,
          items: filterItemsByRoles(item.items, userRoles),
        };
      }
      return item;
    });
}

// Hook personalizzato per gestire la navigazione filtrata
export function useFilteredNavigation() {
  const { user } = useAuth();

  const filteredNavigation = useMemo(() => {
    return navigationConfig
      .map((section) => ({
        ...section,
        items: filterItemsByRoles(section.items, user?.roles),
      }))
      .filter((section) => section.items.length > 0);
  }, [user?.roles]);

  return filteredNavigation;
}

// Utility per determinare se un link è attivo
export function isActiveLink(currentPath: string, href: string): boolean {
  // Exact match
  if (currentPath === href) {
    return true;
  }
  
  // Dashboard deve essere exact match
  if (href === "/dashboard") {
    return false;
  }

  // Per i sub-items, non fare match parziale se il parent è un path più generico
  // Es: /activities non deve matchare /activities/calendar
  // Ma /activities/calendar deve matchare esattamente
  return false;
}

// Utility per determinare se una sezione è attiva
export function isActiveSection(
  currentPath: string,
  sectionPath: string
): boolean {
  if (sectionPath === "/dashboard") {
    return currentPath === sectionPath;
  }
  return currentPath.startsWith(sectionPath);
}

// Utility per verificare se un item ha sotto-items attivi
export function hasActiveSubItem(
  currentPath: string,
  items?: NavigationItem[]
): boolean {
  if (!items || items.length === 0) return false;
  return items.some((subItem) => currentPath === subItem.href);
}

// Icone per l'header
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
