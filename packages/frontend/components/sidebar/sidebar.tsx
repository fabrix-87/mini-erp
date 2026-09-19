"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useFilteredNavigation } from "@/lib/navigation";
import { SidebarNavSection } from "./sidebar-nav-section";

interface SidebarProps {
  mobileOpen: boolean;
  collapsed: boolean;
  onMobileClose: () => void;
}

/**
 * Primary application sidebar with grouped, role-aware navigation.
 */
export function Sidebar({ mobileOpen, collapsed, onMobileClose }: SidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const filteredNavigation = useFilteredNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(["/dashboard"]),
  );

  useEffect(() => {
    if (collapsed) {
      setExpandedItems(new Set());
      return;
    }

    setExpandedItems((previousItems) => {
      const nextItems = new Set(previousItems);

      filteredNavigation.forEach((section) => {
        section.items.forEach((item) => {
          const hasActiveChild = item.items?.some((subItem) => pathname.startsWith(subItem.href));

          if (hasActiveChild) {
            nextItems.add(item.name);
          }
        });
      });

      return nextItems;
    });
  }, [collapsed, filteredNavigation, pathname]);

  useEffect(() => {
    const activeSection = filteredNavigation.find(
      (section) =>
        pathname === section.path ||
        (section.path !== "/dashboard" && pathname.startsWith(`${section.path}/`)),
    );

    setExpandedSections((previousSections) => {
      const nextSections = new Set(previousSections);

      nextSections.add("/dashboard");

      if (activeSection) {
        nextSections.add(activeSection.path);
      }

      return nextSections;
    });
  }, [filteredNavigation, pathname]);

  /**
   * Toggles a nested navigation item in expanded sidebar mode.
   *
   * @param itemName - Localized navigation item label.
   */
  const toggleExpandedItem = (itemName: string): void => {
    setExpandedItems((previousItems) => {
      const nextItems = new Set(previousItems);

      if (nextItems.has(itemName)) {
        nextItems.delete(itemName);
      } else {
        nextItems.add(itemName);
      }

      return nextItems;
    });
  };

  /**
   * Toggles a top-level navigation section in expanded sidebar mode.
   *
   * @param sectionPath - Stable navigation section path.
   */
  const toggleExpandedSection = (sectionPath: string): void => {
    if (sectionPath === "/dashboard") {
      return;
    }

    setExpandedSections((previousSections) => {
      const nextSections = new Set(previousSections);

      if (nextSections.has(sectionPath)) {
        nextSections.delete(sectionPath);
      } else {
        nextSections.add(sectionPath);
      }

      return nextSections;
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
          "fixed bottom-0 left-0 top-12 z-40 flex flex-col overflow-hidden bg-background transition-[width,transform] duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-3 scrollbar-none">
          <div className={cn("space-y-3", collapsed ? "px-2" : "px-2")}>
            {filteredNavigation.map((section) => (
              <SidebarNavSection
                key={section.path}
                section={section}
                pathname={pathname}
                collapsed={collapsed}
                expanded={expandedSections.has(section.path)}
                expandedItems={expandedItems}
                onToggleSection={toggleExpandedSection}
                onToggleItem={toggleExpandedItem}
                onNavigate={onMobileClose}
              />
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
