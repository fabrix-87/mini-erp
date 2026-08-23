import { NavigationSectionConfig } from "@/types/navigation-types";
import {
  Home,
  PhoneCall,
  Users,
  Package,
  BarChart3,
  Calendar,
  UserCheck,
  Building2,
  FileText,
  ShoppingCart,
  Package2,
  Warehouse,
  Receipt,
  CreditCard,
  Percent,
  FileCheck,
  FileMinus,
  ShieldCheck,
  UserCog,
  ArrowLeftRight,
  Layers,
  Tag,
  Coins,
  Languages,
  Briefcase,
  UserPlus,
  Globe,
} from "lucide-react";

/**
 * Static navigation tree definition.
 * Contains structure, paths, icons and i18n keys — no translated strings.
 * Translation keys follow the pattern used in `messages/{locale}/nav.json`.
 */
export const NAVIGATION_TREE: readonly NavigationSectionConfig[] = [
  {
    titleKey: "overview",
    path: "/dashboard",
    items: [
      { nameKey: "dashboard", href: "/dashboard", icon: Home, descKey: "desc_dashboard" },
      {
        nameKey: "activities",
        href: "/activities",
        icon: Calendar,
        descKey: "desc_activities",
        items: [
          { nameKey: "activities_list", href: "/activities" },
          { nameKey: "activities_calendar", href: "/activities/calendar" },
          { nameKey: "activities_new", href: "/activities/new" },
        ],
      },
      { nameKey: "reports", href: "/reports", icon: BarChart3, descKey: "desc_reports" },
    ],
  },
  {
    titleKey: "crm",
    path: "/crm",
    items: [
      { nameKey: "leads", href: "/crm/leads", icon: UserPlus, descKey: "desc_leads" },
      { nameKey: "opportunities", href: "/crm/opportinities", icon: Briefcase, descKey: "desc_opportunities" },
      { nameKey: "customers", href: "/crm/customers", icon: UserCheck, descKey: "desc_customers" },
      { nameKey: "suppliers", href: "/crm/suppliers", icon: Building2, descKey: "desc_suppliers" },
      { nameKey: "contacts", href: "/crm/contacts", icon: Users, descKey: "desc_contacts" },
    ],
  },
  {
    titleKey: "sales",
    path: "/sales",
    items: [
      { nameKey: "quotes", href: "/sales/quotes", icon: FileText, descKey: "desc_quotes" },
      { nameKey: "orders", href: "/sales/orders", icon: ShoppingCart, descKey: "desc_orders" },
    ],
  },
  {
    titleKey: "catalog",
    path: "/catalog",
    items: [
      { nameKey: "products", href: "/catalog/products", icon: Package, descKey: "desc_products" },
      {
        nameKey: "categories",
        href: "/catalog/categories",
        icon: Layers,
        descKey: "desc_categories",
      },
      { nameKey: "brands", href: "/catalog/brands", icon: Tag, descKey: "desc_brands" },
    ],
  },
  {
    titleKey: "purchasing",
    path: "/purchasing",
    hidden: false,
    items: [
      {
        nameKey: "purchase_orders",
        href: "/purchasing/orders",
        icon: ShoppingCart,
        descKey: "desc_purchase_orders",
      },
    ],
  },
  {
    titleKey: "warehouse",
    path: "/warehouse",
    hidden: false,
    items: [
      {
        nameKey: "warehouses",
        href: "/warehouse/warehouses",
        icon: Warehouse,
        descKey: "desc_warehouses",
      },
      {
        nameKey: "inventory",
        href: "/warehouse/inventory",
        icon: Package2,
        descKey: "desc_inventory",
      },
      {
        nameKey: "stock_movements",
        href: "/warehouse/movements",
        icon: ArrowLeftRight,
        descKey: "desc_stock_movements",
      },
      {
        nameKey: "delivery_notes",
        href: "/warehouse/delivery-notes",
        icon: FileCheck,
        descKey: "desc_delivery_notes",
      },
    ],
  },
  {
    titleKey: "finance",
    path: "/finance",
    hidden: false,
    items: [
      { nameKey: "invoices", href: "/finance/invoices", icon: Receipt, descKey: "desc_invoices" },
      {
        nameKey: "credit_notes",
        href: "/finance/credit-notes",
        icon: FileMinus,
        descKey: "desc_credit_notes",
      },
      {
        nameKey: "payments",
        href: "/finance/payments",
        icon: CreditCard,
        descKey: "desc_payments",
      },
      { nameKey: "taxes", href: "/finance/taxes", icon: Percent, descKey: "desc_taxes" },
    ],
  },
  {
    titleKey: "compliance",
    path: "/compliance",
    hidden: false,
    items: [
      {
        nameKey: "intrastat",
        href: "/compliance/intrastat",
        icon: Globe,
        descKey: "desc_intrastat",
      },
    ],
  },
  {
    titleKey: "administration",
    path: "/admin",
    hidden: false,
    items: [
      {
        nameKey: "users",
        href: "/admin/users",
        icon: UserCog,
        roles: ["ADMIN"],
        descKey: "desc_users",
      },
      {
        nameKey: "roles",
        href: "/admin/roles",
        icon: ShieldCheck,
        roles: ["ADMIN"],
        descKey: "desc_roles",
      },
    ],
  },
  {
    titleKey: "system",
    path: "/system",
    hidden: false,
    items: [
      { nameKey: "company", href: "/system/company", icon: Building2, descKey: "desc_company" },
      {
        nameKey: "tenants",
        href: "/system/tenants",
        icon: Layers,
        roles: ["SUPER_ADMIN"],
        descKey: "desc_tenants",
      },
      {
        nameKey: "currencies",
        href: "/system/currencies",
        icon: Coins,
        descKey: "desc_currencies",
      },
      {
        nameKey: "localization",
        href: "/system/localization",
        icon: Languages,
        descKey: "desc_localization",
      },
    ],
  },
  {
    titleKey: "settings",
    path: "/settings",
    hidden: true,
    items: [
      { nameKey: "profile", href: "/settings/profile", hidden: true },
    ],
  },
] as const;

/** Inferred type of a single tree node (leaf or branch) */
export type NavTreeItem = (typeof NAVIGATION_TREE)[number]["items"][number];

/**
 * Set of paths that are section prefixes only — they have no real page
 * and should be excluded from auto-generated breadcrumb trails.
 */
export const SECTION_PATHS = new Set<string>(NAVIGATION_TREE.map((section) => section.path));

/**
 * Maps a section path prefix to its i18n namespace (= messages filename).
 * Derived at module load time from NAVIGATION_TREE.
 * e.g. "/crm" → "crm", "/finance" → "finance"
 */
export const SECTION_NAMESPACE_MAP = Object.fromEntries(
  NAVIGATION_TREE.map((section) => [section.path, section.titleKey]),
) as Record<string, string>;
