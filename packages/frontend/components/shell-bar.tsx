"use client";

import Link from "next/link";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useNavigationContext } from "@/hooks/use-navigation-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShellBarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenMobileSidebar: () => void;
}

/**
 * Global application shell bar inspired by SAP Fiori.
 * It provides branding, route context, and global user actions.
 */
export function ShellBar({
  collapsed,
  onToggleCollapsed,
  onOpenMobileSidebar,
}: ShellBarProps): React.JSX.Element {
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const tNav = useTranslations("nav");
  const { sectionKey, itemKey, descriptionKey } = useNavigationContext();

  const tenantInitial = user?.currentTenant?.name?.[0] ?? "M";
  const tenantName = user?.currentTenant?.name ?? "Mini ERP";
  const sectionLabel = sectionKey ? tNav(sectionKey) : null;
  const itemLabel = itemKey ? tNav(itemKey) : null;
  const descriptionLabel = descriptionKey ? tNav(descriptionKey) : null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex h-12 items-center border-b border-primary/20",
        "bg-primary text-primary-foreground",
      )}
    >
      <div className="flex h-full w-full items-center gap-2 px-3 lg:px-4">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary/80 lg:hidden"
            onClick={onOpenMobileSidebar}
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 text-primary-foreground hover:bg-primary/80 lg:inline-flex"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-2 rounded-md px-1 py-1 hover:bg-primary/80"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-foreground/15 text-xs font-semibold text-primary-foreground">
            {tenantInitial}
          </div>

          <div className="min-w-0">
            <span className="truncate text-sm font-semibold">{tenantName}</span>
          </div>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
            aria-label="Global search"
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 text-primary-foreground hover:bg-primary/80 sm:inline-flex"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 text-primary-foreground hover:bg-primary/80 md:inline-flex"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 text-primary-foreground hover:bg-primary/80 md:inline-flex"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <span className="text-xs font-medium">{resolvedTheme === "dark" ? "L" : "D"}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="ml-1 hidden h-8 items-center gap-2 px-2 text-primary-foreground hover:bg-primary/80 sm:inline-flex"
                aria-label="Open user menu"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/15 text-[10px] font-semibold text-primary-foreground">
                  {user?.details.firstName?.[0]}
                  {user?.details.lastName?.[0]}
                </div>

                <span className="max-w-32 truncate text-xs font-medium">
                  {user?.details.firstName} {user?.details.lastName}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Impostazioni
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
