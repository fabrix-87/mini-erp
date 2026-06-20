// components/Navbar.tsx
"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { headerIcons } from "@/lib/navigation";
import { Check } from "lucide-react";
import PurgeCacheButton from "./clear-cache-button";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    // Rimosso border-b e bg-background, aggiunto bg-transparent
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-transparent px-4 py-2">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon" // Cambiato a size="icon" e rounded-full
        className="lg:hidden rounded-full shrink-0"
        onClick={onMenuClick}
      >
        <headerIcons.Menu className="h-6 w-6 text-sidebar-foreground" />
      </Button>

      {/* Search - Gmail Style */}
      <div className="flex-1 max-w-3xl">
        <div className="relative group">
          <headerIcons.Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="search"
            placeholder="Cerca..."
            // Modifiche chiave: rounded-full, bg-muted (grigio), border-transparent
            className="h-12 w-full rounded-full border-transparent bg-sidebar-accent/50 px-12 text-base shadow-none transition-all hover:bg-sidebar-accent focus-visible:bg-card focus-visible:shadow-md focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pl-2">
        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 text-muted-foreground hover:bg-sidebar-accent"
            >
              <headerIcons.Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <headerIcons.Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Cambia tema</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className="cursor-pointer rounded-lg"
            >
              <headerIcons.Sun className="mr-2 h-4 w-4" />
              Chiaro
              {theme === "light" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className="cursor-pointer rounded-lg"
            >
              <headerIcons.Moon className="mr-2 h-4 w-4" />
              Scuro
              {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className="cursor-pointer rounded-lg"
            >
              <headerIcons.SunMoon className="mr-2 h-4 w-4" />
              Sistema
              {theme === "system" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 text-muted-foreground hover:bg-sidebar-accent relative"
        >
          <headerIcons.Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
          <span className="sr-only">Notifiche</span>
        </Button>
      </div>
      {
        /* Bottone per invalidare la cache - only Dev mode */
        process.env.NODE_ENV === "development" && (
          <PurgeCacheButton/>
        )
      }
    </header>
  );
}
