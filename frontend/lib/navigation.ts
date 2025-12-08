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
    title: "Generale",
    path: "/dashboard",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
        description: "Panoramica generale",
      },
      {
        name: "Aziende",
        href: "/companies",
        icon: Users,
        description: "Gestione aziende",
      },
      {
        name: "Leads",
        href: "/leads",
        icon: PhoneCall,
        description: "Gestione lead",
      },
      {
        name: "Attività",
        href: "/activities",
        icon: Calendar,
        description: "Gestione attività",
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
    path: '/sales',
    items: [
      {
        name: "Prodotti",
        href: "/sales/products",
        icon: Package,
        description: "Catalogo prodotti",
      },
      {
        name: "Documenti",
        href: "/sales/documents",
        icon: Files,
        description: "Documenti",
      },
      {
        name: "Report",
        href: "/dashboard/reports",
        icon: BarChart3,
        description: "Analisi e report",
      },
    ],
  },
  {
    title: "Amministrazione",
    path: "/admin",
    items: [
      {
        name: "Utenti",
        href: "/users",
        icon: Users,
        roles: ["admin"],
        description: "Gestione utenti",
      },
      {
        name: "Impostazioni",
        href: "/dashboard/settings",
        icon: Settings,
        description: "Configurazioni",
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
  return currentPath === href || currentPath.startsWith(href + "/");
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
