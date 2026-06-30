// packages/frontend/app/(protected)/settings/profile/components/settings-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Profilo", href: "/settings/profile" },
  { label: "Sicurezza", href: "/settings/profile/security" },
  { label: "Preferenze", href: "/settings/profile/preferences" },
] as const;

/**
 * Tab-style navigation for the settings/profile section.
 * Highlights the active route using Next.js `usePathname`.
 */
export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b">
      {NAV_ITEMS.map(({ label, href }) => {
        const isActive =
          href === "/settings/profile" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
