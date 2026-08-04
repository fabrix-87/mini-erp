"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  NAVIGATION_TREE,
  SECTION_NAMESPACE_MAP,
  SECTION_PATHS,
  type NavTreeItem,
} from "@/lib/navigation-config";

interface NavigationLeafItem {
  nameKey: string;
  href: string;
}

interface NavigationSection {
  titleKey: string;
  path: string;
  items: readonly NavTreeItem[];
}

export interface NavigationBreadcrumbItem {
  href: string;
  key: string;
  isCurrent: boolean;
  isSection: boolean;
  namespace: string | null;
}

interface NavigationContextResult {
  pathname: string;
  section: NavigationSection | null;
  item: NavTreeItem | null;
  childItem: NavigationLeafItem | null;
  sectionKey: string | null;
  itemKey: string | null;
  currentKey: string | null;
  pageKey: string | null;
  descriptionKey: string | null;
  breadcrumbItems: NavigationBreadcrumbItem[];
  isSectionRoot: boolean;
  isDetailRoute: boolean;
  isEditRoute: boolean;
  isNewRoute: boolean;
}

function isPathMatch(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function normalizePath(pathname: string | null): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/**
 * Resolves route metadata and breadcrumb items from NAVIGATION_TREE.
 */
export function useNavigationContext(): NavigationContextResult {
  const rawPathname = usePathname();
  const pathname = normalizePath(rawPathname);

  return useMemo<NavigationContextResult>(() => {
    let matchedSection: NavigationSection | null = null;
    let matchedItem: NavTreeItem | null = null;
    let matchedChildItem: NavigationLeafItem | null = null;

    for (const section of NAVIGATION_TREE) {
      const normalizedSectionPath = normalizePath(section.path);
      const isSectionMatch =
        pathname === normalizedSectionPath || pathname.startsWith(`${normalizedSectionPath}/`);

      if (!isSectionMatch) {
        continue;
      }

      matchedSection = section as NavigationSection;

      for (const item of section.items) {
        const normalizedItemHref = normalizePath(item.href);

        if (isPathMatch(pathname, normalizedItemHref)) {
          matchedItem = item;
        }

        if ("items" in item && Array.isArray(item.items) && item.items.length > 0) {
          const childMatch =
            item.items.find((subItem) => isPathMatch(pathname, normalizePath(subItem.href))) ?? null;

          if (childMatch) {
            matchedItem = item;
            matchedChildItem = {
              nameKey: childMatch.nameKey,
              href: childMatch.href,
            };
          }
        }
      }

      break;
    }

    const sectionKey = matchedSection?.titleKey ?? null;
    const itemKey = matchedChildItem?.nameKey ?? matchedItem?.nameKey ?? null;
    const currentKey = matchedChildItem?.nameKey ?? matchedItem?.nameKey ?? sectionKey ?? null;
    const pageKey = matchedChildItem?.nameKey ?? matchedItem?.nameKey ?? sectionKey ?? null;

    const descriptionKey =
      matchedItem && "descKey" in matchedItem && typeof matchedItem.descKey === "string"
        ? matchedItem.descKey
        : null;

    const isSectionRoot = SECTION_PATHS.has(pathname);
    const isNewRoute = pathname.endsWith("/new");
    const isEditRoute = pathname.endsWith("/edit");
    const isDetailRoute =
      Boolean(matchedItem) &&
      !isSectionRoot &&
      !isNewRoute &&
      !isEditRoute &&
      pathname !== normalizePath(matchedItem?.href ?? null);

    const breadcrumbItems: NavigationBreadcrumbItem[] = [];

    if (matchedSection) {
      breadcrumbItems.push({
        href: matchedSection.path,
        key: matchedSection.titleKey,
        isCurrent: !matchedItem && !matchedChildItem,
        isSection: true,
        namespace: SECTION_NAMESPACE_MAP[matchedSection.path] ?? null,
      });
    }

    if (matchedItem && !matchedChildItem) {
      breadcrumbItems.push({
        href: matchedItem.href,
        key: matchedItem.nameKey,
        isCurrent: true,
        isSection: false,
        namespace: matchedSection ? SECTION_NAMESPACE_MAP[matchedSection.path] ?? null : null,
      });
    }

    if (matchedItem && matchedChildItem) {
      breadcrumbItems.push({
        href: matchedItem.href,
        key: matchedItem.nameKey,
        isCurrent: false,
        isSection: false,
        namespace: matchedSection ? SECTION_NAMESPACE_MAP[matchedSection.path] ?? null : null,
      });

      breadcrumbItems.push({
        href: matchedChildItem.href,
        key: matchedChildItem.nameKey,
        isCurrent: true,
        isSection: false,
        namespace: matchedSection ? SECTION_NAMESPACE_MAP[matchedSection.path] ?? null : null,
      });
    }

    return {
      pathname,
      section: matchedSection,
      item: matchedItem,
      childItem: matchedChildItem,
      sectionKey,
      itemKey,
      currentKey,
      pageKey,
      descriptionKey,
      breadcrumbItems,
      isSectionRoot,
      isDetailRoute,
      isEditRoute,
      isNewRoute,
    };
  }, [pathname]);
}