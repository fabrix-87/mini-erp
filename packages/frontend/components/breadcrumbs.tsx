"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useNavigationContext } from "@/hooks/use-navigation-context";

/**
 * Renders the current breadcrumb trail from navigation metadata.
 */
export function Breadcrumbs(): React.JSX.Element | null {
  const tNav = useTranslations("nav");
  const { breadcrumbItems, isSectionRoot } = useNavigationContext();

  if (isSectionRoot || breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const label = tNav(item.key);

          return (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />}

              {isLast ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
