// ============================================================================
// Types
// ============================================================================

export interface NavigationItem {
  name: string;
  href: string;
  icon?: any;
  roles?: readonly string[];
  badge?: string | number;
  description?: string;
  items?: NavigationItem[];
}

export interface NavigationSection {
  title: string;
  path: string;
  items: NavigationItem[];
}
