// ============================================================================
// Types
// ============================================================================

import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  name: string;
  href: string;
  icon?: LucideIcon;
  roles?: readonly string[];
  badge?: string | number;
  description?: string;
  items?: NavigationItem[];
  hidden?: boolean;
}

export interface NavigationSection {
  title: string;
  path: string;
  icon: LucideIcon;
  items: NavigationItem[];
  hidden?: boolean;
}

export interface NavigationSectionConfig {
  titleKey: string;
  path: string;
  icon: LucideIcon;
  hidden?: boolean;
  items: readonly (NavigationItemConfig | NavigationLeafConfig)[];
}

export interface NavigationItemConfig {
  nameKey: string;
  href: string;
  icon?: LucideIcon;
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