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
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRoute } from "@/lib/navigation-routes";

interface ShellBarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenMobileSidebar: () => void;
}

/**
 * Global application shell bar.
 * Light/dark header with white background in light mode, aligned with shadcn theme.
 */
export function ShellBar({
  collapsed,
  onToggleCollapsed,
  onOpenMobileSidebar,
}: ShellBarProps): React.JSX.Element {
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const tenantInitial = user?.currentTenant?.name?.[0] ?? "M";
  const tenantName = user?.currentTenant?.name ?? "Mini ERP";

  const iconButtonBase =
    "h-8 w-8 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors";

  // Icon buttons tone: neutral on light, slightly warmer on dark
  const iconButtonTone = isDark
    ? "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground";

  // Brand badge: subtle on light, stronger on dark
  const brandBadgeTone = isDark
    ? "shadow-[0_0_0_1px_rgba(15,23,42,0.55)]"
    : "shadow-[0_0_0_1px_rgba(0,0,0,0.06)]";

  const brandMetaTone = isDark ? "text-muted-foreground" : "text-muted-foreground";

  const userMenuTriggerTone = isDark
    ? "text-foreground hover:bg-accent hover:text-accent-foreground"
    : "text-foreground hover:bg-accent hover:text-accent-foreground";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex h-12 items-center bg-background",
      )}
    >
      <div className="flex h-full w-full items-center gap-2 px-3 lg:px-4">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(iconButtonBase, iconButtonTone, "lg:hidden")}
            onClick={onOpenMobileSidebar}
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(iconButtonBase, iconButtonTone, "hidden lg:inline-flex")}
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
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-full px-2 py-1 text-sm font-medium transition-colors",
            isDark ? "hover:bg-accent" : "hover:bg-accent",
          )}
        >
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
              "bg-primary text-primary-foreground",
              brandBadgeTone,
            )}
          >
            {tenantInitial}
          </div>

          <div className="min-w-0 flex flex-col">
            <span
              className={cn(
                "truncate text-xs font-semibold",
                isDark ? "text-foreground" : "text-foreground",
              )}
            >
              {tenantName}
            </span>
            <span className={cn("truncate text-[10px] font-medium", brandMetaTone)}>Mini ERP</span>
          </div>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(iconButtonBase, iconButtonTone)}
            aria-label="Global search"
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(iconButtonBase, iconButtonTone, "hidden sm:inline-flex")}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(iconButtonBase, iconButtonTone, "hidden md:inline-flex")}
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(iconButtonBase, iconButtonTone, "hidden md:inline-flex")}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "ml-1 hidden h-8 items-center gap-2 rounded-full px-2 text-xs font-medium sm:inline-flex",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  userMenuTriggerTone,
                )}
                aria-label="Open user menu"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                      brandBadgeTone,
                    )}
                  >
                    {user?.details.firstName?.[0]}
                    {user?.details.lastName?.[0]}
                  </span>

                  <span className="max-w-32 truncate">
                    {user?.details.firstName} {user?.details.lastName}
                  </span>
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href={getRoute("profile")} className="group flex w-full items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  <span>Impostazioni</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={logout} className="group cursor-pointer">
                <LogOut className="mr-2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-red-500" />
                <span className="group-hover:text-red-500">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
