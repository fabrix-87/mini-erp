"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useNavigationContext } from "@/hooks/use-navigation-context";
import { PageHeaderActions } from "./page-header-action";
import { PageHeaderAction } from "@/types/page-types";

interface PageHeaderProps {
  actions?: React.ReactNode;
  actionItems?: PageHeaderAction[];
  status?: React.ReactNode;
  className?: string;
}

/**
 * Renders the page-level header with breadcrumbs, title, subtitle, and actions.
 */
export function PageHeader({
  actions,
  actionItems = [],
  status,
  className,
}: PageHeaderProps): React.JSX.Element {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const {
    pageKey,
    descriptionKey,
    breadcrumbItems,
    isSectionRoot,
    isNewRoute,
    isEditRoute,
    isDetailRoute,
  } = useNavigationContext();

  const baseTitle = pageKey ? tNav(pageKey) : tCommon("page");
  const subtitle = descriptionKey ? tNav(descriptionKey) : null;

  const title = (() => {
    if (isNewRoute) return `${tCommon("new")} ${baseTitle}`;
    if (isEditRoute) return `${tCommon("edit")} ${baseTitle}`;
    if (isDetailRoute) return `${baseTitle} ${tCommon("details")}`;
    return baseTitle;
  })();

  return (
    <header className={cn("mb-5 border-b border-border pb-4", className)}>
      {!isSectionRoot && breadcrumbItems.length > 1 && (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;
              const label = tNav(item.key);

              return (
                <li key={item.href} className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  )}
                  {isLast ? (
                    <span aria-current="page" className="font-medium text-foreground">
                      {label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {status && <div className="shrink-0">{status}</div>}
          </div>

          {subtitle && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : actionItems?.length ? (
          <PageHeaderActions actions={actionItems} />
        ) : null}
      </div>
    </header>
  );
}
