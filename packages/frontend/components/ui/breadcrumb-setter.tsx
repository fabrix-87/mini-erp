// components/ui/breadcrumb-setter.tsx
"use client";

import { useBreadcrumbSetter } from "@/hooks/use-breadcrumb";
import { BreadcrumbItem } from "@/types/breadcrumb-types";

// ============================================================================
// Props — mutually exclusive
// ============================================================================

type BreadcrumbSetterProps =
  | { items: BreadcrumbItem[]; title?: never }
  | { title: string; items?: never };

/**
 * Headless client component that drives breadcrumb state via the store.
 * Renders nothing — place it at the top of any page or layout.
 *
 * @example strutturato (nuovo)
 * <BreadcrumbSetter items={[{ label: "Lead", href: "/leads" }, { label: "Nuovo lead" }]} />
 *
 * @example legacy (title singolo)
 * <BreadcrumbSetter title="Dashboard" />
 */
export function BreadcrumbSetter({ items, title }: BreadcrumbSetterProps) {
  useBreadcrumbSetter(items ?? [{ label: title as string }]);
  return null;
}
