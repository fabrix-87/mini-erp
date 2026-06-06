// /lib/constants/breadcrumbs.ts

import { BreadcrumbItem } from "@/types/breadcrumb-types";

// ============================================================================
// Constants & Dictionaries
// ============================================================================

/**
 * Global dictionary for static action routes within the ERP.
 */
export const actionLabels: Record<string, string> = {
  new: "Nuovo",
  edit: "Modifica",
  create: "Crea",
  update: "Aggiorna",
  view: "Visualizza",
  calendar: "Calendario",
  stats: "Statistiche",
  settings: "Impostazioni",
  profile: "Profilo",
  general: "Generali",
  users: "Utenti",
  roles: "Ruoli",
};

/**
 * Global dictionary for entity route segments mapping to their singular localized label.
 */
export const entityLabels: Record<string, string> = {
  activities: "Attività",
  customers: "Cliente",
  suppliers: "Fornitore",
  contacts: "Contatto",
  leads: "Lead",
  products: "Prodotto",
  orders: "Ordine",
  quotes: "Preventivo",
  invoices: "Fattura",
  payments: "Pagamento",
  warehouses: "Magazzino",
  inventory: "Articolo",
  users: "Utente",
  roles: "Ruolo",
};

export const CRUMB_ROOT: BreadcrumbItem = { label: "Home", href: "/dashboard" };
export const CRUMB_CONTACTS: BreadcrumbItem = { label: "Contatti", href: "/contacts" };
export const CRUMB_ACTIVITIES: BreadcrumbItem = { label: "Attività", href: "/activities" };
export const CRUMB_LEADS: BreadcrumbItem = { label: "Leads", href: "/leads" };
export const CRUMB_CUSTOMERS: BreadcrumbItem = { label: "Clienti", href: "/customers" };
export const CRUMB_SUPPLIERS: BreadcrumbItem = { label: "Fornitori", href: "/suppliers" };
export const CRUMB_USERS: BreadcrumbItem = { label: "Utenti", href: "/settings/user" };
export const CRUMB_ROLES: BreadcrumbItem = { label: "Ruoli", href: "/settings/roles" };
