// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFilteredNavigation, isActiveLink } from "@/lib/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut } from "lucide-react"; // ChevronRight rimosso, Gmail non lo usa
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  sidebarOpen: boolean;
  onSidebarClose: () => void;
}

export function Sidebar({ sidebarOpen, onSidebarClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const filteredNavigation = useFilteredNavigation();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onSidebarClose}
        />
      )}

      <aside
        className={cn(
          // Base styles
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar-background transition-transform duration-300 ease-in-out",
          // Desktop styles: Statico e FORZATO a translate-0 (visibile)
          "lg:static lg:translate-x-0",
          // Mobile state: switch in base a sidebarOpen
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo - Aumentato padding per allineamento */}
          <div className="flex h-16 items-center px-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              {/* Icona Logo stile App Icon */}
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-primary-foreground">
                  C
                </span>
              </div>
              <span className="text-xl font-medium text-sidebar-foreground">
                CRM Pro
              </span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {filteredNavigation.map((section) => (
              <div key={section.title} className="space-y-1">
                {/* Titoli sezioni più discreti */}
                {section.title && (
                  <h3 className="px-4 text-[11px] font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                )}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActiveLink(pathname, item.href);

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onSidebarClose}
                        className={cn(
                          "group flex items-center gap-4 rounded-full px-4 py-3 text-sm transition-all", // Rounded-full per effetto pillola
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors",
                            // Icona piena se attivo (simulazione visiva, dipende dall'icon set)
                            active
                              ? "text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/70"
                          )}
                        />

                        <span className="flex-1 truncate leading-none">
                          {item.name}
                        </span>

                        {item.badge && (
                          <span
                            className={cn(
                              "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs",
                              active
                                ? "bg-background/20 text-sidebar-primary-foreground"
                                : "bg-sidebar-accent text-sidebar-foreground"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User section */}
          {user && (
            <div className="p-4 mt-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-14 rounded-full px-3 hover:bg-sidebar-accent"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-8 w-8 rounded-full bg-violet-500 flex items-center justify-center shrink-0 text-white shadow-sm">
                        <span className="text-sm font-medium">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 text-left overflow-hidden">
                        <div className="text-sm font-medium truncate text-sidebar-foreground">
                          {user.username}
                        </div>
                        <div className="text-xs text-sidebar-foreground/60 truncate">
                          {user.roles ? user.roles[0].name : ''}
                        </div>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 rounded-xl p-2"
                  sideOffset={8}
                >
                  <DropdownMenuItem className="rounded-lg py-2">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Impostazioni</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="rounded-lg py-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Esci</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
