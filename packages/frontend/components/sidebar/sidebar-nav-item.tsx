"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const hasActiveChildren = !hasChildren
    ? false
    : item.items!.some((subItem) => subItem.href && pathname.startsWith(subItem.href));
  const Icon = item.icon;

  const content = (
    <div
      className={cn(
        "flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors",
        "hover:bg-accent/60 hover:text-foreground",
        isCurrent && "border-l-2 border-primary bg-primary/5 text-foreground",
        !isCurrent && (hasActiveChildren ? "text-foreground" : "text-muted-foreground"),
        collapsed && "justify-center px-0"
      )}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      {!collapsed && <span className="min-w-0 flex-1 truncate">{item.name}</span>}
      {!collapsed && hasChildren && (
        isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />
      )}
    </div>
  );

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          className="w-full"
          onClick={() => !collapsed && onToggleExpanded(item.name)}
          aria-expanded={!collapsed ? isExpanded : undefined}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent side="right">{item.name}</TooltipContent>
            </Tooltip>
          ) : (
            content
          )}
        </button>

        {!collapsed && isExpanded && (
          <div className="ml-3 border-l border-border pl-2">
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