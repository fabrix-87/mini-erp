// packages/frontend/app/(protected)/settings/profile/components/settings-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShieldIcon, UserCog, UserIcon } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { getRoute } from "@/lib/navigation-routes";

/**
 * Tab-style navigation for the settings/profile section.
 * Highlights the active route using Next.js `usePathname`.
 */
export function SettingsNav() {
  const pathname = usePathname();
  const baseRoute = getRoute("profile");
  const t = useTranslations("settings.navItems");

  const NAV_ITEMS = useMemo(
    () => [
      { label: t("profile"), href: "/settings/profile", icon: UserIcon },
      { label: t("security"), href: "/settings/profile/security", icon: ShieldIcon },
      { label: t("preferences"), href: "/settings/profile/preferences", icon: UserCog },
    ],
    [t],
  );

  return (
    <nav className="flex gap-0.5 border-b">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive = href === baseRoute ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 -mb-px transition-colors",
              isActive
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
            )}
          >
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
