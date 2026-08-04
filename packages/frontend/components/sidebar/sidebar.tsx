"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useFilteredNavigation } from "@/lib/navigation";
import { SidebarNavItem } from "./sidebar-nav-item";

interface SidebarProps {
  mobileOpen: boolean;
  collapsed: boolean;
  onMobileClose: () => void;
}

/**
 * Primary application sidebar focused only on navigation.
 */
export function Sidebar({ mobileOpen, collapsed, onMobileClose }: SidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const filteredNavigation = useFilteredNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (collapsed) {
      setExpandedItems(new Set());
      return;
    }

    const nextExpanded = new Set<string>();

    filteredNavigation.forEach((section) => {
      section.items.forEach((item) => {
        if (item.items?.some((subItem) => pathname.startsWith(subItem.href))) {
          nextExpanded.add(item.name);
        }
      });
    });

    setExpandedItems(nextExpanded);
  }, [collapsed, filteredNavigation, pathname]);

  const toggleExpanded = (itemName: string): void => {
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

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-12 bottom-0 z-40 flex flex-col overflow-hidden border-r border-border bg-background transition-all duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <nav className="flex-1 overflow-y-auto py-3">
          <div className="space-y-4">
            {filteredNavigation.map((section) => (
              <div key={section.title} className="space-y-1 px-2">
                {!collapsed && (
                  <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {section.title}
                  </p>
                )}

                {section.items.map((item) => (
                  <SidebarNavItem
                    key={item.name}
                    item={item}
                    pathname={pathname}
                    collapsed={collapsed}
                    expandedItems={expandedItems}
                    onToggleExpanded={toggleExpanded}
                    onNavigate={onMobileClose}
                  />
                ))}
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
