// components/Breadcrumbs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { navigationConfig } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  if (
    pathSegments.length === 0 ||
    (pathSegments.length === 1 && pathSegments[0] === "dashboard")
  ) {
    return null;
  }

  const findPageTitle = (href: string): string => {
    for (const section of navigationConfig) {
      const item = section.items.find((item) => item.href === href);
      if (item) return item.name;
    }
    return href.split("/").pop() || "Pagina";
  };

  const breadcrumbs = pathSegments.flatMap((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    
    if (navigationConfig.find((section) => section.path === href)) return[];
    return [{
      name: findPageTitle(href),
      href,
    }];
  });

  return (
    <div className="border-b px-6 py-2">
      <nav aria-label="Breadcrumb" className="py-3">
        <ol className="flex items-center space-x-1 text-sm">
          <li className="flex items-center">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-accent"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
          </li>

          {breadcrumbs.map((item, index) => (          
            <li key={item.href} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              <Link
                href={item.href}
                className={cn(
                  "rounded-md px-2 py-1 transition-colors hover:bg-accent",
                  index === breadcrumbs.length - 1
                    ? "text-foreground font-medium pointer-events-none"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
