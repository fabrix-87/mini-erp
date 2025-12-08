// lib/navigation.ts
import { useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
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

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
  badge?: string | number;
  description?: string;
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
        roles: ["admin"],
        description: "Gestione utenti",
      },
      {
        name: "Ruoli",
        href: "/settings/roles",
        icon: ShieldCheck,
        roles: ["admin"],
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

// Hook personalizzato per gestire la navigazione filtrata
export function useFilteredNavigation() {
  const { user } = useAuth();

  const filteredNavigation = useMemo(() => {
    return navigationConfig
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            !item.roles || (user?.roles && item.roles.includes(user.roles))
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [user?.roles]);

  return filteredNavigation;
}

// Utility per determinare se un link è attivo
export function isActiveLink(currentPath: string, href: string): boolean {
  if (href === "/dashboard") {
    return currentPath === href;
  }
  return currentPath === href || currentPath.startsWith(href + "/");
}

// Utility per determinare se una sezione è attiva
export function isActiveSection(currentPath: string, sectionPath: string): boolean {
  if (sectionPath === "/dashboard") {
    return currentPath === sectionPath;
  }
  return currentPath.startsWith(sectionPath);
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
