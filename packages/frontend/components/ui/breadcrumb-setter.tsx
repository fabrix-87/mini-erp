// packages/frontend/components/ui/breadcrumb-setter.tsx
'use client';

import { useBreadcrumbTitle } from '@/hooks/use-breadcrumb-title';

interface BreadcrumbSetterProps {
  /** The title to display in the breadcrumb */
  title: string;
}

/**
 * Headless client component that sets the breadcrumb title.
 * Renders nothing — use it inside Server Components to drive
 * breadcrumb state from the server layout.
 */
export function BreadcrumbSetter({ title }: BreadcrumbSetterProps) {
  useBreadcrumbTitle(title);
  return null;
}
