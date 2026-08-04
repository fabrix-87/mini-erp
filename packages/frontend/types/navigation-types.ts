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
  hidden?: boolean;
}

export interface NavigationSection {
  title: string;
  path: string;
  items: NavigationItem[];
  hidden?: boolean;
}

export interface NavigationSectionConfig {
  titleKey: string;
  path: string;
  hidden?: boolean;
  items: readonly (NavigationItemConfig | NavigationLeafConfig)[];
}

export interface NavigationItemConfig {
  nameKey: string;
  href: string;
  icon?: any;
  descKey?: string;
  roles?: readonly string[];
  hidden?: boolean;
  items?: readonly NavigationLeafConfig[];
}

export interface NavigationLeafConfig {
  nameKey: string;
  href: string;
  hidden?: boolean;
}