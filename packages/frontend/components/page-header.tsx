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
  /**
   * Inline status/badge rendered immediately after the title text.
   * Use for a single prominent status indicator.
   * For multiple badges, prefer the `badges` prop.
   */
  status?: React.ReactNode;
  /**
   * Array of badge/chip nodes rendered inline after the title (and after `status`).
   * Use this for multiple tags, labels or status indicators.
   *
   * @example
   * badges={[
   *   <Badge key="active" variant="default">Attivo</Badge>,
   *   <Badge key="vip" variant="outline">VIP</Badge>,
   * ]}
   */
  badges?: React.ReactNode[];
  /**
   * Leading slot rendered to the left of the title block.
   * Typically an avatar, entity icon or company logo.
   *
   * @example
   * leading={
   *   <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold shrink-0">
   *     {getInitials(contact.firstName, contact.lastName)}
   *   </div>
   * }
   */
  leading?: React.ReactNode;
  /**
   * Metadata slot rendered below the title row.
   * Use for secondary info: position, company, email, tags, etc.
   * Replaces `subtitle` when richer markup is needed.
   *
   * @example
   * meta={<p className="text-sm text-muted-foreground">CTO · Acme S.r.l.</p>}
   */
  meta?: React.ReactNode;
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
  /**
   * Extra breadcrumb items added after the auto-resolved trail.
   * Use on detail pages to append the entity name as final segment.
   */
  extraBreadcrumbs?: { label: string; href?: string }[];
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
  badges,
  leading,
  meta,
  className,
  title: titleOverride,
  subtitle: subtitleOverride,
  breadcrumbLabel,
  extraBreadcrumbs,
}: PageHeaderProps): React.JSX.Element {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const { pageKey, descriptionKey, isNewRoute, isEditRoute, isDetailRoute } =
    useNavigationContext();

  const baseTitle = pageKey ? tNav(pageKey) : tCommon("page_header.generic_page");

  const computedTitle = (() => {
    if (isNewRoute) return `${tCommon("page_header.new")} ${baseTitle}`;
    if (isEditRoute) return `${tCommon("page_header.edit")} ${baseTitle}`;
    if (isDetailRoute) return `${baseTitle} ${tCommon("page_header.details")}`;
    return baseTitle;
  })();

  const title = titleOverride ?? computedTitle;
  const subtitle = subtitleOverride ?? (descriptionKey ? tNav(descriptionKey) : null);

  // `meta` slot ha precedenza su `subtitle` quando entrambi sono presenti
  const hasMetaContent = meta != null;
  const hasSubtitle = !hasMetaContent && subtitle != null;

  return (
    <header className={cn("mb-5 border-b border-border pb-4", className)}>
      <Breadcrumbs currentLabel={breadcrumbLabel ?? titleOverride} extraItems={extraBreadcrumbs} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Left block: leading slot + title row + meta */}
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {/* Leading slot (avatar, icon, logo) */}
          {leading && <div className="shrink-0">{leading}</div>}

          {/* Title + badges + subtitle/meta */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-3xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>

              {/* Single status node (legacy compat) */}
              {status && <div className="shrink-0">{status}</div>}

              {/* Badge array */}
              {badges?.map((badge, i) => (
                <div key={i} className="shrink-0">
                  {badge}
                </div>
              ))}
            </div>

            {/* Meta slot (rich markup) takes precedence over plain subtitle */}
            {hasMetaContent && <div className="mt-1">{meta}</div>}
            {hasSubtitle && (
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right block: actions */}
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : actionItems?.length ? (
          <PageHeaderActions actions={actionItems} />
        ) : null}
      </div>
    </header>
  );
}
