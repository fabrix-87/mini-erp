"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { NavigationSection } from "@/types/navigation-types";
import { SidebarNavItem } from "./sidebar-nav-item";

interface SidebarNavSectionProps {
  section: NavigationSection;
  pathname: string;
  collapsed: boolean;
  expanded: boolean;
  expandedItems: Set<string>;
  onToggleSection: (sectionPath: string) => void;
  onToggleItem: (itemName: string) => void;
  onNavigate: () => void;
}

/**
 * Renders an expandable navigation section and its items in the application sidebar.
 */
export function SidebarNavSection({
  section,
  pathname,
  collapsed,
  expanded,
  expandedItems,
  onToggleSection,
  onToggleItem,
  onNavigate,
}: SidebarNavSectionProps): React.JSX.Element {
  const SectionIcon = section.icon;
  const isActiveSection =
    pathname === section.path ||
    (section.path !== "/dashboard" && pathname.startsWith(`${section.path}/`));

  const collapsedSectionButtonClassName = cn(
  "flex h-8 w-full items-center justify-center rounded-md transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  isActiveSection
    ? "bg-primary/8 text-primary"
    : "text-muted-foreground hover:bg-accent hover:text-foreground",
);

  if (collapsed) {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  collapsedSectionButtonClassName,
                  isActiveSection && "bg-primary/8 text-primary",
                )}
                aria-label={section.title}
              >
                <SectionIcon className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <TooltipContent side="right">{section.title}</TooltipContent>
        </Tooltip>

        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={10}
          className="z-50 min-w-56 rounded-lg p-1"
        >
          <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5">
            <SectionIcon className="h-4 w-4 text-muted-foreground" />
            {section.title}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {section.items.map((item) => {
            const hasChildren = Boolean(item.items?.length);

            if (hasChildren) {
              return (
                <DropdownMenuSub key={item.name}>
                  <DropdownMenuSubTrigger>{item.name}</DropdownMenuSubTrigger>

                  <DropdownMenuSubContent className="min-w-52">
                    {item.items?.map((subItem) => (
                      <DropdownMenuItem key={subItem.name} asChild>
                        <Link href={subItem.href} onClick={onNavigate} className="cursor-pointer">
                          {subItem.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            }

            return (
              <DropdownMenuItem
                key={item.name}
                asChild
                className={cn(pathname.startsWith(item.href) && "bg-accent")}
              >
                <Link href={item.href} onClick={onNavigate} className="cursor-pointer">
                  {item.name}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <section className="space-y-1" aria-labelledby={`sidebar-section-${section.path}`}>
      <button
        id={`sidebar-section-${section.path}`}
        type="button"
        className={cn(
          "flex h-8 w-full items-center rounded-md px-2 text-xs font-medium uppercase tracking-wide transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActiveSection
            ? "text-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
        onClick={() => onToggleSection(section.path)}
        aria-expanded={expanded}
        aria-controls={`sidebar-section-content-${section.path}`}
      >
        <span className="min-w-0 flex-1 truncate text-left">{section.title}</span>

        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        )}
      </button>

      {expanded && (
        <div id={`sidebar-section-content-${section.path}`} className="space-y-1">
          {section.items.map((item) => (
            <SidebarNavItem
              key={item.name}
              item={item}
              pathname={pathname}
              collapsed={false}
              expandedItems={expandedItems}
              onToggleExpanded={onToggleItem}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
