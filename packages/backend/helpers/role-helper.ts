import { Prisma } from "@/generated/prisma/client";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Selezione standard per Role con relazioni
 */
export const roleSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
  permissions: {
    select: {
      permission: {
        select: {
          id: true,
          code: true,
          resource: true,
          action: true,
          description: true,
        },
      },
    },
  },
  _count: {
    select: {
      users: true,
    },
  },
} satisfies Prisma.RoleSelect;

/**
 * Selezione standard per Permission con relazioni
 */
export const getPermissionSelection = () =>
  ({
    id: true,
    code: true,
    resource: true,
    action: true,
    description: true,
    createdAt: true,
    updatedAt: true,
    roles: {
      select: {
        role: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    },
  }) satisfies Prisma.PermissionSelect;

/**
 * Formatta i permessi per la risposta
 */
export const formatRolePermissions = (role: any) => {
  return {
    ...role,
    permissions: role.permissions?.map((rp: any) => rp.permission) || [],
    userCount: role._count?.users || 0,
  };
};

/**
 * Formatta i ruoli per la risposta
 */
export const formatPermissionRoles = (permission: any) => {
  return {
    ...permission,
    roles: permission.roles?.map((rp: any) => rp.role) || [],
  };
};

// Lista di permessi predefiniti da sincronizzare
export const defaultPermissions = [
  // Activity permissions
  {
    code: "activity:read",
    resource: "activity",
    action: "read",
    description: "Lettura attività",
  },
  {
    code: "activity:create",
    resource: "activity",
    action: "create",
    description: "Creazione attività",
  },
  {
    code: "activity:update",
    resource: "activity",
    action: "update",
    description: "Modifica attività",
  },
  {
    code: "activity:delete",
    resource: "activity",
    action: "delete",
    description: "Eliminazione attività",
  },
  {
    code: "activity:manage",
    resource: "activity",
    action: "manage",
    description: "Gestione completa attività",
  },

  // Activity permissions
  {
    code: "address:read",
    resource: "address",
    action: "read",
    description: "Lettura indirizzi",
  },
  {
    code: "address:create",
    resource: "address",
    action: "create",
    description: "Creazione indirizzi",
  },
  {
    code: "address:update",
    resource: "address",
    action: "update",
    description: "Modifica indirizzi",
  },
  {
    code: "address:delete",
    resource: "address",
    action: "delete",
    description: "Eliminazione indirizzi",
  },
  {
    code: "address:manage",
    resource: "address",
    action: "manage",
    description: "Gestione completa indirizzi",
  },

  // User permissions
  { code: "user:read", resource: "user", action: "read", description: "Lettura utenti" },
  { code: "user:create", resource: "user", action: "create", description: "Creazione utenti" },
  { code: "user:update", resource: "user", action: "update", description: "Modifica utenti" },
  {
    code: "user:delete",
    resource: "user",
    action: "delete",
    description: "Eliminazione utenti",
  },
  {
    code: "user:manage",
    resource: "user",
    action: "manage",
    description: "Gestione completa utenti",
  },

  // Role permissions
  { code: "role:read", resource: "role", action: "read", description: "Lettura ruoli" },
  { code: "role:create", resource: "role", action: "create", description: "Creazione ruoli" },
  { code: "role:update", resource: "role", action: "update", description: "Modifica ruoli" },
  {
    code: "role:delete",
    resource: "role",
    action: "delete",
    description: "Eliminazione ruoli",
  },
  {
    code: "role:manage",
    resource: "role",
    action: "manage",
    description: "Gestione completa ruoli",
  },

  // Permission permissions
  {
    code: "permission:read",
    resource: "permission",
    action: "read",
    description: "Lettura permessi",
  },
  {
    code: "permission:create",
    resource: "permission",
    action: "create",
    description: "Creazione permessi",
  },
  {
    code: "permission:update",
    resource: "permission",
    action: "update",
    description: "Modifica permessi",
  },
  {
    code: "permission:delete",
    resource: "permission",
    action: "delete",
    description: "Eliminazione permessi",
  },
  {
    code: "permission:manage",
    resource: "permission",
    action: "manage",
    description: "Gestione completa permessi",
  },

  // Product permissions
  {
    code: "product:read",
    resource: "product",
    action: "read",
    description: "Lettura prodotti",
  },
  {
    code: "product:create",
    resource: "product",
    action: "create",
    description: "Creazione prodotti",
  },
  {
    code: "product:update",
    resource: "product",
    action: "update",
    description: "Modifica prodotti",
  },
  {
    code: "product:delete",
    resource: "product",
    action: "delete",
    description: "Eliminazione prodotti",
  },
  {
    code: "product:manage",
    resource: "product",
    action: "manage",
    description: "Gestione completa prodotti",
  },

  // Document permissions
  {
    code: "document:read",
    resource: "document",
    action: "read",
    description: "Lettura documenti",
  },
  {
    code: "document:create",
    resource: "document",
    action: "create",
    description: "Creazione documenti",
  },
  {
    code: "document:update",
    resource: "document",
    action: "update",
    description: "Modifica documenti",
  },
  {
    code: "document:delete",
    resource: "document",
    action: "delete",
    description: "Eliminazione documenti",
  },
  {
    code: "document:approve",
    resource: "document",
    action: "approve",
    description: "Approvazione documenti",
  },
  {
    code: "document:manage",
    resource: "document",
    action: "manage",
    description: "Gestione completa documenti",
  },

  // Company permissions
  { code: "company:read", resource: "company", action: "read", description: "Lettura aziende" },
  {
    code: "company:create",
    resource: "company",
    action: "create",
    description: "Creazione aziende",
  },
  {
    code: "company:update",
    resource: "company",
    action: "update",
    description: "Modifica aziende",
  },
  {
    code: "company:delete",
    resource: "company",
    action: "delete",
    description: "Eliminazione aziende",
  },
  {
    code: "company:manage",
    resource: "company",
    action: "manage",
    description: "Gestione completa aziende",
  },

  // Customer permissions
  {
    code: "customer:read",
    resource: "customer",
    action: "read",
    description: "Lettura clienti",
  },
  {
    code: "customer:create",
    resource: "customer",
    action: "create",
    description: "Creazione clienti",
  },
  {
    code: "customer:update",
    resource: "customer",
    action: "update",
    description: "Modifica clienti",
  },
  {
    code: "customer:delete",
    resource: "customer",
    action: "delete",
    description: "Eliminazione clienti",
  },
  {
    code: "customer:manage",
    resource: "customer",
    action: "manage",
    description: "Gestione completa clienti",
  },

  // Supplier permissions
  {
    code: "supplier:read",
    resource: "supplier",
    action: "read",
    description: "Lettura fornitori",
  },
  {
    code: "supplier:create",
    resource: "supplier",
    action: "create",
    description: "Creazione fornitori",
  },
  {
    code: "supplier:update",
    resource: "supplier",
    action: "update",
    description: "Modifica fornitori",
  },
  {
    code: "supplier:delete",
    resource: "supplier",
    action: "delete",
    description: "Eliminazione fornitori",
  },
  {
    code: "supplier:manage",
    resource: "supplier",
    action: "manage",
    description: "Gestione completa fornitori",
  },

  // Contact permissions
  {
    code: "contact:read",
    resource: "contact",
    action: "read",
    description: "Lettura contatti",
  },
  {
    code: "contact:create",
    resource: "contact",
    action: "create",
    description: "Creazione contatti",
  },
  {
    code: "contact:update",
    resource: "contact",
    action: "update",
    description: "Modifica contatti",
  },
  {
    code: "contact:delete",
    resource: "contact",
    action: "delete",
    description: "Eliminazione contatti",
  },
  {
    code: "contact:manage",
    resource: "contact",
    action: "manage",
    description: "Gestione completa contatti",
  },

  // Opportunity permissions
  {
    code: "opportunity:read",
    resource: "opportunity",
    action: "read",
    description: "Lettura opportunità",
  },
  {
    code: "opportunity:create",
    resource: "opportunity",
    action: "create",
    description: "Creazione opportunità",
  },
  {
    code: "opportunity:update",
    resource: "opportunity",
    action: "update",
    description: "Modifica opportunità",
  },
  {
    code: "opportunity:delete",
    resource: "opportunity",
    action: "delete",
    description: "Eliminazione opportunità",
  },
  {
    code: "opportunity:manage",
    resource: "opportunity",
    action: "manage",
    description: "Gestione completa opportunità",
  },

  // Warehouse permissions
  {
    code: "warehouse:read",
    resource: "warehouse",
    action: "read",
    description: "Lettura magazzino",
  },
  {
    code: "warehouse:update",
    resource: "warehouse",
    action: "update",
    description: "Modifica magazzino",
  },
  {
    code: "warehouse:manage",
    resource: "warehouse",
    action: "manage",
    description: "Gestione completa magazzino",
  },

  // Tax permissions
  { code: "tax:read", resource: "tax", action: "read", description: "Lettura tasse" },
  { code: "tax:create", resource: "tax", action: "create", description: "Creazione tasse" },
  { code: "tax:update", resource: "tax", action: "update", description: "Modifica tasse" },
  { code: "tax:delete", resource: "tax", action: "delete", description: "Eliminazione tasse" },
  {
    code: "tax:manage",
    resource: "tax",
    action: "manage",
    description: "Gestione completa tasse",
  },

  // Payment permissions
  {
    code: "payment:read",
    resource: "payment",
    action: "read",
    description: "Lettura metodi pagamento",
  },
  {
    code: "payment:create",
    resource: "payment",
    action: "create",
    description: "Creazione metodi pagamento",
  },
  {
    code: "payment:update",
    resource: "payment",
    action: "update",
    description: "Modifica metodi pagamento",
  },
  {
    code: "payment:delete",
    resource: "payment",
    action: "delete",
    description: "Eliminazione metodi pagamento",
  },
  {
    code: "payment:manage",
    resource: "payment",
    action: "manage",
    description: "Gestione completa metodi pagamento",
  },

  // PriceList permissions
  {
    code: "pricelist:read",
    resource: "pricelist",
    action: "read",
    description: "Lettura listini prezzi",
  },
  {
    code: "pricelist:create",
    resource: "pricelist",
    action: "create",
    description: "Creazione listini prezzi",
  },
  {
    code: "pricelist:update",
    resource: "pricelist",
    action: "update",
    description: "Modifica listini prezzi",
  },
  {
    code: "pricelist:delete",
    resource: "pricelist",
    action: "delete",
    description: "Eliminazione listini prezzi",
  },
  {
    code: "pricelist:manage",
    resource: "pricelist",
    action: "manage",
    description: "Gestione completa listini prezzi",
  },

  // Category permissions
  {
    code: "category:read",
    resource: "category",
    action: "read",
    description: "Lettura categorie",
  },
  {
    code: "category:create",
    resource: "category",
    action: "create",
    description: "Creazione categorie",
  },
  {
    code: "category:update",
    resource: "category",
    action: "update",
    description: "Modifica categorie",
  },
  {
    code: "category:delete",
    resource: "category",
    action: "delete",
    description: "Eliminazione categorie",
  },
  {
    code: "category:manage",
    resource: "category",
    action: "manage",
    description: "Gestione completa categorie",
  },

  // Dashboard permissions
  {
    code: "dashboard:read",
    resource: "dashboard",
    action: "read",
    description: "Visualizzazione dashboard",
  },
  {
    code: "dashboard:manage",
    resource: "dashboard",
    action: "manage",
    description: "Gestione completa dashboard",
  },

  // Report permissions
  {
    code: "report:read",
    resource: "report",
    action: "read",
    description: "Visualizzazione report",
  },
  {
    code: "report:export",
    resource: "report",
    action: "export",
    description: "Esportazione report",
  },
  {
    code: "report:manage",
    resource: "report",
    action: "manage",
    description: "Gestione completa report",
  },
];
