// /types/breadcrumb-types.ts
export interface BreadcrumbItem {
  /** Visible label */
  label: string;
  /** Optional link — last item is typically not linked */
  href?: string;
}

export interface BreadcrumbState {
  items: BreadcrumbItem[];
  pathname: string;
}
