// packages/backend/prisma/seeds/rbac.seed.ts

import bcrypt from "bcryptjs";

import { prisma } from "../../config/prisma-config";
import { PermissionScope } from "../../generated/prisma/enums";

/// Manual find-then-create/update for GLOBAL roles (tenantId = NULL).
///
/// Why not `prisma.role.upsert`:
/// - `Role.code` has no plain @unique.
/// - The partial index `unique_global_role_code` (`@@unique([code], where: { tenantId: null })`)
///   is never exposed by Prisma Client as a usable `where` key — partial indexes are only
///   guaranteed unique under their filter condition, so Prisma's WhereUniqueInput generator
///   deliberately omits their `map` name.
/// - The non-partial composite `@@unique([tenantId, code])` (exposed as `tenantId_code`)
///   cannot be used either: Postgres treats every NULL as distinct in a standard unique
///   constraint, so this composite does NOT actually guarantee global uniqueness when
///   tenantId is NULL, and Prisma's generated type correctly rejects `tenantId: null` there.
///
/// The only safe unique target is the true primary key `id`, hence find-then-create/update.
async function upsertGlobalRole(
  code: string,
  data: { name: string; description?: string; isDefault?: boolean },
) {
  const existing = await prisma.role.findFirst({ where: { code, tenantId: null } });

  if (existing) {
    return prisma.role.update({ where: { id: existing.id }, data });
  }

  return prisma.role.create({ data: { code, tenantId: null, ...data } });
}

async function seedRBAC() {
  console.log("🌱 Starting RBAC seed...");

  try {
    // ========================================================================
    // 1. PERMESSI
    // ========================================================================
    // NOTE: Permission.scope is a real column (OWN | TEAM | ALL, default OWN)
    // and part of the @@unique([resource, action, scope]) constraint.
    // The previous seed omitted it entirely, silently defaulting every row
    // to scope "OWN". This platform enforces isolation at the tenant level
    // (no ownerId-based record filtering exists on these aggregates), so the
    // correct default scope for standard business CRUD is ALL. OWN/TEAM are
    // reserved for future per-user/per-team restrictions and are not seeded.
    console.log("📝 Creating permissions...");

    const permissions = [
      // User
      {
        code: "user:read",
        resource: "user",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura utenti",
      },
      {
        code: "user:create",
        resource: "user",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione utenti",
      },
      {
        code: "user:update",
        resource: "user",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica utenti",
      },
      {
        code: "user:delete",
        resource: "user",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione utenti",
      },
      {
        code: "user:manage",
        resource: "user",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa utenti",
      },

      // Activity
      {
        code: "activity:read",
        resource: "activity",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura attività",
      },
      {
        code: "activity:create",
        resource: "activity",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione attività",
      },
      {
        code: "activity:update",
        resource: "activity",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica attività",
      },
      {
        code: "activity:delete",
        resource: "activity",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione attività",
      },
      {
        code: "activity:manage",
        resource: "activity",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa attività",
      },

      // Role
      {
        code: "role:read",
        resource: "role",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura ruoli",
      },
      {
        code: "role:create",
        resource: "role",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione ruoli",
      },
      {
        code: "role:update",
        resource: "role",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica ruoli",
      },
      {
        code: "role:delete",
        resource: "role",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione ruoli",
      },
      {
        code: "role:manage",
        resource: "role",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa ruoli",
      },

      // Permission
      {
        code: "permission:read",
        resource: "permission",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura permessi",
      },
      {
        code: "permission:create",
        resource: "permission",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione permessi",
      },
      {
        code: "permission:update",
        resource: "permission",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica permessi",
      },
      {
        code: "permission:delete",
        resource: "permission",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione permessi",
      },
      {
        code: "permission:manage",
        resource: "permission",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa permessi",
      },

      // Dashboard
      {
        code: "dashboard:read",
        resource: "dashboard",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura Dashboard",
      },
      {
        code: "dashboard:manage",
        resource: "dashboard",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa Dashboard",
      },

      // Country (global master data)
      {
        code: "country:read",
        resource: "country",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura Stati",
      },
      {
        code: "country:manage",
        resource: "country",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa Stati",
      },

      // Currency (global master data)
      {
        code: "currency:read",
        resource: "currency",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura Valute",
      },
      {
        code: "currency:manage",
        resource: "currency",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa Valute",
      },

      // Language (global master data)
      {
        code: "language:read",
        resource: "language",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura Lingue",
      },
      {
        code: "language:manage",
        resource: "language",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa Lingue",
      },

      // Product
      {
        code: "product:read",
        resource: "product",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura prodotti",
      },
      {
        code: "product:create",
        resource: "product",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione prodotti",
      },
      {
        code: "product:update",
        resource: "product",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica prodotti",
      },
      {
        code: "product:delete",
        resource: "product",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione prodotti",
      },
      {
        code: "product:manage",
        resource: "product",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa prodotti",
      },

      // Category (catalog taxonomy)
      {
        code: "category:read",
        resource: "category",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura categorie",
      },
      {
        code: "category:create",
        resource: "category",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione categorie",
      },
      {
        code: "category:update",
        resource: "category",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica categorie",
      },
      {
        code: "category:delete",
        resource: "category",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione categorie",
      },
      {
        code: "category:manage",
        resource: "category",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa categorie",
      },

      // Manufacturer (tenant.manufacturers — aggregate root)
      {
        code: "manufacturer:read",
        resource: "manufacturer",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura produttori/marchi",
      },
      {
        code: "manufacturer:create",
        resource: "manufacturer",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione produttori/marchi",
      },
      {
        code: "manufacturer:update",
        resource: "manufacturer",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica produttori/marchi",
      },
      {
        code: "manufacturer:delete",
        resource: "manufacturer",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione produttori/marchi",
      },
      {
        code: "manufacturer:manage",
        resource: "manufacturer",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa produttori/marchi",
      },

      // Feature (specification groups/values)
      {
        code: "feature:read",
        resource: "feature",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura caratteristiche prodotto",
      },
      {
        code: "feature:create",
        resource: "feature",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione caratteristiche prodotto",
      },
      {
        code: "feature:update",
        resource: "feature",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica caratteristiche prodotto",
      },
      {
        code: "feature:delete",
        resource: "feature",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione caratteristiche prodotto",
      },
      {
        code: "feature:manage",
        resource: "feature",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa caratteristiche prodotto",
      },

      // Attribute (EAV variant-generating attributes, e.g. color/size)
      {
        code: "attribute:read",
        resource: "attribute",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura attributi variante",
      },
      {
        code: "attribute:create",
        resource: "attribute",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione attributi variante",
      },
      {
        code: "attribute:update",
        resource: "attribute",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica attributi variante",
      },
      {
        code: "attribute:delete",
        resource: "attribute",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione attributi variante",
      },
      {
        code: "attribute:manage",
        resource: "attribute",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa attributi variante",
      },

      // Document
      {
        code: "document:read",
        resource: "document",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura documenti",
      },
      {
        code: "document:create",
        resource: "document",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione documenti",
      },
      {
        code: "document:update",
        resource: "document",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica documenti",
      },
      {
        code: "document:delete",
        resource: "document",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione documenti",
      },
      {
        code: "document:manage",
        resource: "document",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa documenti",
      },

      // Company
      {
        code: "company:read",
        resource: "company",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura aziende",
      },
      {
        code: "company:create",
        resource: "company",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione aziende",
      },
      {
        code: "company:update",
        resource: "company",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica aziende",
      },
      {
        code: "company:delete",
        resource: "company",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione aziende",
      },
      {
        code: "company:manage",
        resource: "company",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa aziende",
      },

      // Customer
      {
        code: "customer:read",
        resource: "customer",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura Clienti",
      },
      {
        code: "customer:create",
        resource: "customer",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione Clienti",
      },
      {
        code: "customer:update",
        resource: "customer",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica Clienti",
      },
      {
        code: "customer:delete",
        resource: "customer",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione Clienti",
      },
      {
        code: "customer:manage",
        resource: "customer",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa Clienti",
      },

      // Contact
      {
        code: "contact:read",
        resource: "contact",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura Contatti",
      },
      {
        code: "contact:create",
        resource: "contact",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione Contatti",
      },
      {
        code: "contact:update",
        resource: "contact",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica Contatti",
      },
      {
        code: "contact:delete",
        resource: "contact",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione Contatti",
      },
      {
        code: "contact:manage",
        resource: "contact",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa Contatti",
      },

      // Address
      {
        code: "address:read",
        resource: "address",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura Indirizzi",
      },
      {
        code: "address:create",
        resource: "address",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione Indirizzi",
      },
      {
        code: "address:update",
        resource: "address",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica Indirizzi",
      },
      {
        code: "address:delete",
        resource: "address",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione Indirizzi",
      },
      {
        code: "address:manage",
        resource: "address",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa Indirizzi",
      },

      // Supplier
      {
        code: "supplier:read",
        resource: "supplier",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura Fornitori",
      },
      {
        code: "supplier:create",
        resource: "supplier",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione Fornitori",
      },
      {
        code: "supplier:update",
        resource: "supplier",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica Fornitori",
      },
      {
        code: "supplier:delete",
        resource: "supplier",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione Fornitori",
      },
      {
        code: "supplier:manage",
        resource: "supplier",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa Fornitori",
      },

      // Lead (CRM)
      {
        code: "lead:read",
        resource: "lead",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura Lead",
      },
      {
        code: "lead:create",
        resource: "lead",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione Lead",
      },
      {
        code: "lead:update",
        resource: "lead",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica Lead",
      },
      {
        code: "lead:delete",
        resource: "lead",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione Lead",
      },
      {
        code: "lead:manage",
        resource: "lead",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa Lead",
      },

      // Opportunity (CRM — covers OpportunityProduct/ClosedReason via parent)
      {
        code: "opportunity:read",
        resource: "opportunity",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura Opportunità",
      },
      {
        code: "opportunity:create",
        resource: "opportunity",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione Opportunità",
      },
      {
        code: "opportunity:update",
        resource: "opportunity",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica Opportunità",
      },
      {
        code: "opportunity:delete",
        resource: "opportunity",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione Opportunità",
      },
      {
        code: "opportunity:manage",
        resource: "opportunity",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa Opportunità",
      },

      // Warehouse (covers StockMovement/StockBatch/StockReservation/VirtualStock via parent)
      {
        code: "warehouse:read",
        resource: "warehouse",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura magazzino",
      },
      {
        code: "warehouse:create",
        resource: "warehouse",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione magazzino",
      },
      {
        code: "warehouse:update",
        resource: "warehouse",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica magazzino",
      },
      {
        code: "warehouse:delete",
        resource: "warehouse",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione magazzino",
      },
      {
        code: "warehouse:manage",
        resource: "warehouse",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa magazzino",
      },

      // Bank (BankAccount)
      {
        code: "bank:read",
        resource: "bank",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura conti bancari",
      },
      {
        code: "bank:create",
        resource: "bank",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione conti bancari",
      },
      {
        code: "bank:update",
        resource: "bank",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica conti bancari",
      },
      {
        code: "bank:delete",
        resource: "bank",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione conti bancari",
      },
      {
        code: "bank:manage",
        resource: "bank",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa conti bancari",
      },

      // Payment (covers PaymentBatch/PaymentMethod via parent)
      {
        code: "payment:read",
        resource: "payment",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura pagamenti",
      },
      {
        code: "payment:create",
        resource: "payment",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione pagamenti",
      },
      {
        code: "payment:update",
        resource: "payment",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica pagamenti",
      },
      {
        code: "payment:delete",
        resource: "payment",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Elimina pagamenti",
      },
      {
        code: "payment:manage",
        resource: "payment",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa pagamenti",
      },

      // Tax (TaxRule — covers WithholdingTaxType/WithholdingTaxSettlement config via same domain)
      {
        code: "tax:read",
        resource: "tax",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura aliquota tasse",
      },
      {
        code: "tax:create",
        resource: "tax",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione aliquota tasse",
      },
      {
        code: "tax:update",
        resource: "tax",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica aliquota tasse",
      },
      {
        code: "tax:delete",
        resource: "tax",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Elimina aliquota tasse",
      },
      {
        code: "tax:manage",
        resource: "tax",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa aliquota tasse",
      },

      // Accounting (FiscalYear, AccountingPeriod, ChartOfAccount, CostCenter, JournalEntry*)
      // Actions follow the real JournalEntry/FiscalYear lifecycle instead of generic CRUD:
      // DRAFT entries can be created and read; POSTED entries are immutable and only
      // reversible via a counter-entry; periods/fiscal years are closed, never deleted.
      {
        code: "accounting:read",
        resource: "accounting",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura piano dei conti e registrazioni",
      },
      {
        code: "accounting:create",
        resource: "accounting",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione registrazioni contabili in bozza",
      },
      {
        code: "accounting:post",
        resource: "accounting",
        action: "post",
        scope: PermissionScope.ALL,
        description: "Contabilizzazione registrazioni (DRAFT → POSTED)",
      },
      {
        code: "accounting:reverse",
        resource: "accounting",
        action: "reverse",
        scope: PermissionScope.ALL,
        description: "Storno registrazioni contabilizzate",
      },
      {
        code: "accounting:close",
        resource: "accounting",
        action: "close",
        scope: PermissionScope.ALL,
        description: "Chiusura periodi contabili ed esercizi fiscali",
      },
      {
        code: "accounting:manage",
        resource: "accounting",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa contabilità (piano dei conti, centri di costo, template)",
      },

      // Intrastat (correctable via correctionSequence, hence full CRUD)
      {
        code: "intrastat:read",
        resource: "intrastat",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura dichiarazioni Intrastat",
      },
      {
        code: "intrastat:create",
        resource: "intrastat",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione dichiarazioni Intrastat",
      },
      {
        code: "intrastat:update",
        resource: "intrastat",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica/correzione dichiarazioni Intrastat",
      },
      {
        code: "intrastat:delete",
        resource: "intrastat",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Eliminazione dichiarazioni Intrastat",
      },
      {
        code: "intrastat:manage",
        resource: "intrastat",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa Intrastat",
      },

      // SDI (Sistema di Interscambio — SdiNotification is system-generated, no user action needed)
      {
        code: "sdi:read",
        resource: "sdi",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura stato trasmissioni SDI",
      },
      {
        code: "sdi:send",
        resource: "sdi",
        action: "send",
        scope: PermissionScope.ALL,
        description: "Invio fatture allo SDI",
      },
      {
        code: "sdi:manage",
        resource: "sdi",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa SDI",
      },

      // PriceList
      {
        code: "pricelist:read",
        resource: "pricelist",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura Listini",
      },
      {
        code: "pricelist:create",
        resource: "pricelist",
        action: "create",
        scope: PermissionScope.ALL,
        description: "Creazione Listini",
      },
      {
        code: "pricelist:update",
        resource: "pricelist",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica Listini",
      },
      {
        code: "pricelist:delete",
        resource: "pricelist",
        action: "delete",
        scope: PermissionScope.ALL,
        description: "Elimina Listini",
      },
      {
        code: "pricelist:manage",
        resource: "pricelist",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa Listini",
      },

      // Settings (per-tenant configuration singleton — no create/delete)
      {
        code: "settings:read",
        resource: "settings",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura impostazioni tenant",
      },
      {
        code: "settings:update",
        resource: "settings",
        action: "update",
        scope: PermissionScope.ALL,
        description: "Modifica impostazioni tenant",
      },
      {
        code: "settings:manage",
        resource: "settings",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa impostazioni tenant",
      },

      // Audit (AuditLog — system-generated, append-only, read-only for end users)
      {
        code: "audit:read",
        resource: "audit",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura log di audit",
      },

      // Tenant (PLATFORM-LEVEL — intentionally excluded from the blanket
      // "assign every permission to ADMIN" step below. A tenant-scoped
      // Administrator must never be able to manage/delete other tenants.)
      {
        code: "tenant:read",
        resource: "tenant",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Lettura tenant (platform)",
      },
      {
        code: "tenant:manage",
        resource: "tenant",
        action: "manage",
        scope: PermissionScope.ALL,
        description: "Gestione completa tenant (platform)",
      },

      // Report
      {
        code: "report:read",
        resource: "report",
        action: "read",
        scope: PermissionScope.ALL,
        description: "Visualizzazione report",
      },
      {
        code: "report:export",
        resource: "report",
        action: "export",
        scope: PermissionScope.ALL,
        description: "Esportazione report",
      },
    ];

    const createdPermissions = await Promise.all(
      permissions.map((p) =>
        prisma.permission.upsert({
          where: { code: p.code },
          update: p,
          create: p,
        }),
      ),
    );

    console.log(`   ✅ ${createdPermissions.length} permissions upserted`);

    const permissionMap = Object.fromEntries(createdPermissions.map((p) => [p.code, p.id]));

    // Platform-only permissions excluded from the blanket ADMIN grant below.
    const PLATFORM_ONLY_CODES = new Set(["tenant:read", "tenant:manage"]);
    const tenantScopedPermissions = createdPermissions.filter(
      (p) => !PLATFORM_ONLY_CODES.has(p.code),
    );

    // ========================================================================
    // 2. RUOLI (globali — tenantId: null)
    // ========================================================================
    console.log("👥 Creating roles...");

    const adminRole = await upsertGlobalRole("ADMIN", {
      name: "Administrator",
      description: "Accesso completo al sistema (esclusa amministrazione piattaforma multi-tenant)",
      isDefault: false,
    });

    // Blanket grant: every TENANT-SCOPED permission, but not tenant:read/tenant:manage.
    await prisma.rolePermission.createMany({
      data: tenantScopedPermissions.map((p) => ({ roleId: adminRole.id, permissionId: p.id })),
      skipDuplicates: true,
    });

    const managerRole = await upsertGlobalRole("MANAGER", {
      name: "Manager",
      description: "Gestione vendite, magazzino, catalogo, documenti e contabilità operativa",
      isDefault: false,
    });

    await prisma.rolePermission.createMany({
      data: [
        "product:read",
        "product:create",
        "product:update",
        "product:delete",
        "category:read",
        "category:create",
        "category:update",
        "manufacturer:read",
        "manufacturer:create",
        "manufacturer:update",
        "document:read",
        "document:create",
        "document:update",
        "company:read",
        "company:create",
        "company:update",
        "customer:read",
        "customer:create",
        "customer:update",
        "supplier:read",
        "supplier:create",
        "supplier:update",
        "lead:read",
        "opportunity:read",
        "opportunity:update",
        "warehouse:read",
        "warehouse:update",
        "bank:read",
        "accounting:read",
        "accounting:create",
        "accounting:post",
        "intrastat:read",
        "settings:read",
        "audit:read",
        "report:read",
      ].map((code) => ({ roleId: managerRole.id, permissionId: permissionMap[code] })),
      skipDuplicates: true,
    });

    const salesRole = await upsertGlobalRole("SALES", {
      name: "Sales Representative",
      description: "Gestione vendite, clienti e pipeline commerciale",
      isDefault: false,
    });

    await prisma.rolePermission.createMany({
      data: [
        "product:read",
        "category:read",
        "manufacturer:read",
        "document:read",
        "document:create",
        "document:update",
        "company:read",
        "company:create",
        "company:update",
        "customer:read",
        "customer:create",
        "customer:update",
        "contact:read",
        "contact:create",
        "contact:update",
        "address:read",
        "address:create",
        "address:update",
        "lead:read",
        "lead:create",
        "lead:update",
        "opportunity:read",
        "opportunity:create",
        "opportunity:update",
        "activity:read",
        "activity:create",
        "activity:update",
        "report:read",
      ].map((code) => ({ roleId: salesRole.id, permissionId: permissionMap[code] })),
      skipDuplicates: true,
    });

    const warehouseRole = await upsertGlobalRole("WAREHOUSE", {
      name: "Warehouse Operator",
      description: "Gestione magazzino e stock",
      isDefault: false,
    });

    await prisma.rolePermission.createMany({
      data: ["product:read", "warehouse:read", "warehouse:update", "document:read"].map((code) => ({
        roleId: warehouseRole.id,
        permissionId: permissionMap[code],
      })),
      skipDuplicates: true,
    });

    const userRole = await upsertGlobalRole("USER", {
      name: "User",
      description: "Utente base con permessi limitati",
      isDefault: true,
    });

    await prisma.rolePermission.createMany({
      data: ["product:read", "category:read", "document:read", "company:read", "report:read"].map(
        (code) => ({
          roleId: userRole.id,
          permissionId: permissionMap[code],
        }),
      ),
      skipDuplicates: true,
    });

    console.log("   ✅ 5 roles upserted: ADMIN, MANAGER, SALES, WAREHOUSE, USER");

    // ========================================================================
    // 3. UTENTI DI TEST + UserTenantMembership
    // ========================================================================
    console.log("👤 Creating test users...");

    // Dev mode: assegna a tutti i tenant esistenti
    const allTenants = await prisma.tenant.findMany({ select: { id: true } });

    if (allTenants.length === 0) {
      throw new Error("Nessun tenant trovato. Eseguire prima il seed dei Tenant.");
    }

    console.log(`   ℹ️  Tenant trovati: ${allTenants.map((t) => t.id).join(", ")}`);

    const hashedPassword = await bcrypt.hash("Password123!", 12);

    // ── admin ────────────────────────────────────────────────────────────────
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        active: true,
        details: { create: { firstName: "Admin", lastName: "User" } },
      },
    });

    // Admin → ADMIN su tutti i tenant
    for (const { id: tenantId } of allTenants) {
      const membership = await prisma.userTenantMembership.upsert({
        where: { userId_tenantId: { userId: adminUser.id, tenantId } },
        update: {},
        create: { userId: adminUser.id, tenantId, status: "ACTIVE" },
      });
      await prisma.userTenantMembershipRole.upsert({
        where: { membershipId_roleId: { membershipId: membership.id, roleId: adminRole.id } },
        update: {},
        create: { membershipId: membership.id, tenantId, roleId: adminRole.id },
      });
    }

    // ── manager ──────────────────────────────────────────────────────────────
    const managerUser = await prisma.user.upsert({
      where: { email: "manager@example.com" },
      update: {},
      create: {
        username: "manager",
        email: "manager@example.com",
        password: hashedPassword,
        active: true,
        details: { create: { firstName: "Manager", lastName: "User" } },
      },
    });

    // Manager → MANAGER sul primo tenant, USER sugli altri
    for (const [index, { id: tenantId }] of allTenants.entries()) {
      const role = index === 0 ? managerRole : userRole;
      const membership = await prisma.userTenantMembership.upsert({
        where: { userId_tenantId: { userId: managerUser.id, tenantId } },
        update: {},
        create: { userId: managerUser.id, tenantId, status: "ACTIVE" },
      });
      await prisma.userTenantMembershipRole.upsert({
        where: { membershipId_roleId: { membershipId: membership.id, roleId: role.id } },
        update: {},
        create: { membershipId: membership.id, tenantId, roleId: role.id },
      });
    }

    // ── sales ─────────────────────────────────────────────────────────────────
    const salesUser = await prisma.user.upsert({
      where: { email: "sales@example.com" },
      update: {},
      create: {
        username: "sales",
        email: "sales@example.com",
        password: hashedPassword,
        active: true,
        details: { create: { firstName: "Sales", lastName: "User" } },
      },
    });

    // Sales → SALES sul primo tenant, USER sugli altri
    for (const [index, { id: tenantId }] of allTenants.entries()) {
      const role = index === 0 ? salesRole : userRole;
      const membership = await prisma.userTenantMembership.upsert({
        where: { userId_tenantId: { userId: salesUser.id, tenantId } },
        update: {},
        create: { userId: salesUser.id, tenantId, status: "ACTIVE" },
      });
      await prisma.userTenantMembershipRole.upsert({
        where: { membershipId_roleId: { membershipId: membership.id, roleId: role.id } },
        update: {},
        create: { membershipId: membership.id, tenantId, roleId: role.id },
      });
    }

    console.log(`   ✅ 3 test users creati su ${allTenants.length} tenant`);
    console.log("\n📋 Test Credentials:");
    console.log("-----------------------------------");
    console.log("Admin:   admin@example.com   / Password123! → ADMIN su tutti i tenant");
    console.log(
      "Manager: manager@example.com / Password123! → MANAGER su tenant[0], USER sugli altri",
    );
    console.log(
      "Sales:   sales@example.com   / Password123! → SALES su tenant[0], USER sugli altri",
    );
    console.log("-----------------------------------\n");

    // ========================================================================
    // 4. RIEPILOGO
    // ========================================================================
    console.log("📊 Seed Summary:");
    console.log(`   - ${createdPermissions.length} permissions`);
    console.log("   - 5 roles: ADMIN, MANAGER, SALES, WAREHOUSE, USER");
    console.log("   - 3 test users con UserTenantMembership su tutti i tenant");
    console.log("\n✅ RBAC seed completed successfully!\n");
  } catch (error) {
    console.error("❌ Error seeding RBAC:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedRBAC().catch((e) => {
  console.error(e);
  process.exit(1);
});

export default seedRBAC;
