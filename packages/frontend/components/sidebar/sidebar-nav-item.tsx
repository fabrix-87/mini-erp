"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavigationItem } from "@/types/navigation-types";

interface SidebarNavItemProps {
  item: NavigationItem;
  pathname: string;
  collapsed: boolean;
  expandedItems: Set<string>;
  onToggleExpanded: (itemName: string) => void;
  onNavigate: () => void;
}

/**
 * Renders a primary or nested navigation item inside the application sidebar.
 */
export function SidebarNavItem({
  item,
  pathname,
  collapsed,
  expandedItems,
  onToggleExpanded,
  onNavigate,
}: SidebarNavItemProps): React.JSX.Element {
  const hasChildren = Boolean(item.items && item.items.length > 0);
  const isExpanded = expandedItems.has(item.name);
  const isCurrent = !hasChildren && item.href && pathname.startsWith(item.href);
  const hasActiveChildren = hasChildren
    ? item.items!.some((subItem) => subItem.href && pathname.startsWith(subItem.href))
    : false;
  const Icon = item.icon;

  const content = (
    <div
      className={cn(
        "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-foreground",
        isCurrent &&
          "bg-primary/8 text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_18%,transparent)]",
        !isCurrent &&
          (hasActiveChildren ? "bg-accent/50 text-foreground" : "text-muted-foreground"),
        collapsed && "justify-center px-0",
      )}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      {!collapsed && <span className="min-w-0 flex-1 truncate text-left">{item.name}</span>}
      {!collapsed &&
        hasChildren &&
        (isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        ))}
    </div>
  );

  if (hasChildren && collapsed) {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button type="button" className="w-full text-left" aria-label={item.name}>
                {content}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">{item.name}</TooltipContent>
        </Tooltip>

        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={10}
          className="z-50 min-w-56 rounded-lg"
        >
          {item.items?.map((subItem) => (
            <DropdownMenuItem key={subItem.name} asChild>
              <Link href={subItem.href ?? "#"} onClick={onNavigate} className="cursor-pointer">
                {subItem.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          className="w-full text-left"
          onClick={() => onToggleExpanded(item.name)}
          aria-expanded={isExpanded}
        >
          {content}
        </button>

        {isExpanded && (
          <div className="ml-4 space-y-1 border-l border-border/70 pl-3">
            {item.items!.map((subItem) => (
              <SidebarNavItem
                key={subItem.name}
                item={subItem}
                pathname={pathname}
                collapsed={false}
                expandedItems={expandedItems}
                onToggleExpanded={onToggleExpanded}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const linkNode = (
    <Link href={item.href ?? "#"} onClick={onNavigate}>
      {content}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkNode}</TooltipTrigger>
        <TooltipContent side="right">{item.name}</TooltipContent>
      </Tooltip>
    );
  }

  return linkNode;
}
