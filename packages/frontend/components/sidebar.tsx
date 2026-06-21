// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useFilteredNavigation, isActiveLink, hasActiveSubItem } from "@/lib/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { NavigationItem } from "@/types/navigation-types";

interface SidebarProps {
  sidebarOpen: boolean;
  onSidebarClose: () => void;
}

export function Sidebar({ sidebarOpen, onSidebarClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const filteredNavigation = useFilteredNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Auto-espandi items che contengono sub-items attivi
  useEffect(() => {
    const itemsToExpand = new Set<string>();
    filteredNavigation.forEach((section) => {
      section.items.forEach((item) => {
        if (item.items && hasActiveSubItem(pathname, item.items)) {
          itemsToExpand.add(item.name);
        }
      });
    });
    setExpandedItems(itemsToExpand);
  }, [pathname, filteredNavigation]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemName)) {
        next.delete(itemName);
      } else {
        next.add(itemName);
      }
      return next;
    });
  };

  const renderNavItem = (item: NavigationItem, level: number = 0) => {
    const isActive = isActiveLink(pathname, item.href);
    const hasSubItems = item.items && item.items.length > 0;
    const isExpanded = expandedItems.has(item.name);
    const hasActiveSub = hasActiveSubItem(pathname, item.items);
    const Icon = item.icon;

    // Se è un parent con sub-items, NON evidenziarlo come attivo
    // Evidenzia solo se è un link diretto o un sub-item
    const shouldHighlight = hasSubItems ? false : isActive;

    return (
      <div key={item.name}>
        {hasSubItems ? (
          // Item con sotto-menu (clickable per espandere)
          <button
            onClick={() => toggleExpanded(item.name)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              hasActiveSub ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {Icon && <Icon className="h-5 w-5 shrink-0" />}
            <span className="flex-1 text-left">{item.name}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
          </button>
        ) : (
          // Item normale (link)
          <Link
            href={item.href}
            onClick={onSidebarClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              level > 0 && "pl-11", // Indenta i sub-items
              shouldHighlight ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            {Icon && level === 0 && <Icon className="h-5 w-5 shrink-0" />}
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        )}

        {/* Sotto-items (collapsible) */}
        {hasSubItems && isExpanded && (
          <div className="mt-1 space-y-1 ml-3 border-l-2 border-border pl-2">
            {item.items!.map((subItem) => renderNavItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onSidebarClose} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg">
            {user?.currentTenant.name?.[0] || "M"}
          </div>
          <span className="font-semibold text-lg text-foreground">
            {user?.currentTenant.name || "Mini ERP"}
          </span>
        </div>

        {/* Navigazione */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-6">
            {filteredNavigation.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">{section.items.map((item) => renderNavItem(item))}</div>
              </div>
            ))}
          </div>
        </nav>

        {/* User Menu */}
        <div className="border-t border-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 px-2">
                <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-sm font-semibold">
                  {user?.details.firstName?.[0]}
                  {user?.details.lastName?.[0]}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {user?.details.firstName} {user?.details.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/settings/profile" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Impostazioni
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
