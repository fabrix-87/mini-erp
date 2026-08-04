"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useNavigationContext } from "@/hooks/use-navigation-context";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeaderActions } from "./page-header-action";
import { PageHeaderAction } from "@/types/page-types";

interface PageHeaderProps {
  actions?: React.ReactNode;
  actionItems?: PageHeaderAction[];
  status?: React.ReactNode;
  className?: string;
  /**
   * Overrides the computed title (which otherwise comes from the matched
   * NAVIGATION_TREE entry, e.g. "Cliente" / "Nuovo Cliente"). Use this on
   * detail pages to show the entity's own name (e.g. a company name).
   */
  title?: string;
  /** Overrides the computed subtitle (`descKey` translation). */
  subtitle?: string;
  /** Overrides the last breadcrumb segment label. See `Breadcrumbs` `currentLabel`. */
  breadcrumbLabel?: string;
}

/**
 * Renders the page-level header with breadcrumbs, title, subtitle, and actions.
 * Title/subtitle/breadcrumb are auto-derived from NAVIGATION_TREE via the
 * current route; pass `title` / `subtitle` / `breadcrumbLabel` to override
 * them on detail pages where the entity has its own display name.
 */
export function PageHeader({
  actions,
  actionItems = [],
  status,
  className,
  title: titleOverride,
  subtitle: subtitleOverride,
  breadcrumbLabel,
}: PageHeaderProps): React.JSX.Element {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const { pageKey, descriptionKey, isNewRoute, isEditRoute, isDetailRoute } =
    useNavigationContext();

  const baseTitle = pageKey ? tNav(pageKey) : tCommon("page");

  const computedTitle = (() => {
    if (isNewRoute) return `${tCommon("new")} ${baseTitle}`;
    if (isEditRoute) return `${tCommon("edit")} ${baseTitle}`;
    if (isDetailRoute) return `${baseTitle} ${tCommon("details")}`;
    return baseTitle;
  })();

  const title = titleOverride ?? computedTitle;
  const subtitle = subtitleOverride ?? (descriptionKey ? tNav(descriptionKey) : null);

  return (
    <header className={cn("mb-5 border-b border-border pb-4", className)}>
      <Breadcrumbs currentLabel={breadcrumbLabel ?? titleOverride} />

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
