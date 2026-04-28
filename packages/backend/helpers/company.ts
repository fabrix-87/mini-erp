import { prisma as prismaGlobal } from "../config/prisma-client";
import { AddressType, Prisma, PrismaClient } from "../generated/prisma/client";

import { CompanyFilters, CustomerFilters, SupplierFilters, AddressFilters } from "../types/company";

// ============================================================================
// WHERE CLAUSE BUILDERS
// ============================================================================

/**
 * Costruisce WHERE clause per Company
 */
export const buildCompanyWhereClause = (filters: CompanyFilters): Prisma.CompanyWhereInput => {
  const where: Prisma.CompanyWhereInput = {};

  if (filters.search) {
    where.OR = [
      { code: { contains: filters.search, mode: "insensitive" } },
      { companyName: { contains: filters.search, mode: "insensitive" } },
      { tradeName: { contains: filters.search, mode: "insensitive" } },
      { vatNumber: { contains: filters.search, mode: "insensitive" } },
      { taxCode: { contains: filters.search, mode: "insensitive" } },
      { mainEmail: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.status) where.status = filters.status as any;
  if (filters.entityType) where.entityType = filters.entityType as any;
  if (filters.countryCode) where.countryCode = filters.countryCode;
  if (filters.assignedUserId) where.assignedUserId = filters.assignedUserId;

  return where;
};

/**
 * Costruisce WHERE clause per Customer
 */
export const buildCustomerWhereClause = (filters: CustomerFilters): Prisma.CustomerWhereInput => {
  const where: Prisma.CustomerWhereInput = {
    company: buildCompanyWhereClause(filters),
  };

  if (filters.type) where.type = filters.type as any;
  if (filters.priority) where.priority = filters.priority as any;
  if (filters.segment) where.segment = filters.segment as any;
  if (filters.creditStatus) where.creditStatus = filters.creditStatus as any;
  if (filters.isDeleted) where.deletedAt = filters.isDeleted ? { not: null } : null;
  
  return where;
};

/**
 * Costruisce WHERE clause per Supplier
 */
export const buildSupplierWhereClause = (filters: SupplierFilters): Prisma.SupplierWhereInput => {
  const where: Prisma.SupplierWhereInput = {
    company: buildCompanyWhereClause(filters),
  };

  if (filters.minRating) {
    where.rating = { gte: filters.minRating };
  }

  if (filters.hasProducts !== undefined) {
    where.products = filters.hasProducts ? { some: {} } : { none: {} };
  }

  return where;
};

/**
 * Costruisce WHERE clause per Address
 */
export const buildAddressWhereClause = (
  filters: AddressFilters,
): Prisma.CompanyAddressWhereInput => {
  const where: Prisma.CompanyAddressWhereInput = {};

  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.addressType) where.addressType = filters.addressType as any;
  if (filters.countryCode) where.countryCode = filters.countryCode;
  if (filters.isPrimary !== undefined) where.isPrimary = filters.isPrimary;

  return where;
};

// ============================================================================
// INCLUDE BUILDERS
// ============================================================================

export const getCompanyBaseInclude = (includeRelations = true) => {
  if (!includeRelations) return undefined;
  return {
    country: {
      select: { code: true, name: true, isEU: true },
    },
    /**
     * Returns the legal address
     */
    addresses: {
      where: { addressType: AddressType.LEGAL },
      include: { country: true as const },
      take: 1,
    },
    user: {
      select: {
        id: true,
        username: true,
        email: true,
        details: { select: { firstName: true, lastName: true } },
      },
    },
  };
};

export const getCompanyFullInclude = () => ({
  country: {
    select: { code: true, name: true, isEU: true },
  },
  user: {
    select: {
      id: true,
      username: true,
      email: true,
      details: { select: { firstName: true, lastName: true } },
    },
  },
  // Tutti gli indirizzi — formatCompanyResponse li separa
  addresses: {
    include: { country: true as const },
    orderBy: { isPrimary: "desc" as const },
  },
  contacts: {
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          mobilePhone: true,
        },
      },
    },
    where: { contact: { active: true } },
    orderBy: { isPrimaryContact: "desc" as const },
    take: 5,
  },
  _count: {
    select: {
      addresses: true,
      contacts: true,
      documents: true,
      notes: true,
    },
  },
});


// ============================================================================
// INCLUDE TYPES
// ============================================================================

/** Return type of getCompanyBaseInclude() */
type CompanyBaseInclude = ReturnType<typeof getCompanyBaseInclude>;

/** Return type of getCompanyFullInclude() */
type CompanyFullInclude = ReturnType<typeof getCompanyFullInclude>;

/**
 * Shared detailed fields added when detailed = true.
 * Extracted to avoid repetition between Customer and Supplier.
 */
type CustomerDetailedFields = {
  defaultPriceList: { select: { id: true; code: true; name: true; currency: true } };
  customerTaxRule:  { select: { id: true; code: true; name: true } };
  paymentMethod:    { include: { translations: true } };
  _count:           { select: { documentsOut: true; opportunities: true } };
};

type CustomerBaseFields = {
  defaultPriceList: undefined;
  customerTaxRule:  undefined;
  paymentMethod:    undefined;
  _count:           undefined;
};

type SupplierDetailedFields = {
  _count: { select: { documentsIn: true; products: true } };
};

type SupplierBaseFields = {
  _count: undefined;
};

// ============================================================================
// INCLUDE BUILDERS WITH OVERLOADS
// ============================================================================

/**
 * Returns Prisma include for Customer queries.
 * When detailed = true, includes full company data + commercial relations.
 * When detailed = false (default), includes base company data only.
 */
export function getCustomerInclude(detailed: true): {
  company: { include: CompanyFullInclude };
} & CustomerDetailedFields;
export function getCustomerInclude(detailed?: false): {
  company: { include: CompanyBaseInclude };
} & CustomerBaseFields;
export function getCustomerInclude(detailed = false) {
  return {
    company: {
      include: detailed ? getCompanyFullInclude() : getCompanyBaseInclude(),
    },
    defaultPriceList: detailed
      ? { select: { id: true, code: true, name: true, currency: true } }
      : undefined,
    customerTaxRule: detailed
      ? { select: { id: true, code: true, name: true } }
      : undefined,
    paymentMethod: detailed
      ? { include: { translations: true } }
      : undefined,
    _count: detailed
      ? { select: { documentsOut: true, opportunities: true } }
      : undefined,
  };
}

/**
 * Returns Prisma include for Supplier queries.
 * When detailed = true, includes full company data + document/product counts.
 * When detailed = false (default), includes base company data only.
 */
export function getSupplierInclude(detailed: true): {
  company: { include: CompanyFullInclude };
} & SupplierDetailedFields;
export function getSupplierInclude(detailed?: false): {
  company: { include: CompanyBaseInclude };
} & SupplierBaseFields;
export function getSupplierInclude(detailed = false) {
  return {
    company: {
      include: detailed ? getCompanyFullInclude() : getCompanyBaseInclude(),
    },
    _count: detailed
      ? { select: { documentsIn: true, products: true } }
      : undefined,
  };
}

/**
 * Extended include for group/hierarchy views.
 * Use only when the parent-child relationship is needed
 * (e.g. customer detail page, group report).
 */
export const getCustomerGroupInclude = () => ({
  parentCustomer: {
    select: {
      id: true,
      company: { select: { companyName: true, code: true } },
    },
  },
  subsidiaries: {
    select: {
      id: true,
      company: { select: { companyName: true, code: true } },
    },
  },
});

/**
 * Extended include for group/hierarchy views.
 * Use only when the parent-child relationship is needed
 * (e.g. supplier detail page, group report).
 */
export const getSupplierGroupInclude = () => ({
  parentSupplier: {
    select: {
      id: true,
      company: { select: { companyName: true, code: true } },
    },
  },
  subsidiaries: {
    select: {
      id: true,
      company: { select: { companyName: true, code: true } },
    },
  },
});

export const getAddressInclude = () => ({
  country: {
    select: { code: true, name: true, isEU: true },
  },
  company: {
    select: { id: true, code: true, companyName: true },
  },
});

// ============================================================================
// QUERY HELPERS
// ============================================================================

export const buildOrderBy = (
  sortBy: string = "id",
  sortOrder: "asc" | "desc" = "desc",
): Prisma.CompanyOrderByWithRelationInput => {
  const orderByMap: Record<string, any> = {
    id: { id: sortOrder },
    code: { code: sortOrder },
    name: { companyName: sortOrder },
    country: { country: { name: sortOrder } },
    status: { status: sortOrder },
    createdAt: { createdAt: sortOrder },
    totalRevenue: { totalRevenue: sortOrder },
  };
  return orderByMap[sortBy] || { id: sortOrder };
};

// ============================================================================
// ASYNC DB HELPERS
// ============================================================================

/**
 * Verifica se può eliminare company
 */
export const canDeleteCompany = async (
  prisma: PrismaClient,
  companyId: number,
): Promise<{ canDelete: boolean; reason?: string }> => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      _count: {
        select: {
          documents: true,
          customers: true,
          suppliers: true,
        },
      },
    },
  });

  if (!company) return { canDelete: false, reason: "Company non trovata" };

  const totalRelations =
    company._count.documents + company._count.customers + company._count.suppliers;

  if (totalRelations > 0) {
    return {
      canDelete: false,
      reason: `Company ha ${totalRelations} relazioni attive`,
    };
  }

  return { canDelete: true };
};

/**
 * Verifica se può impostare indirizzo primario
 */
export const canSetPrimaryAddress = async (
  prisma: PrismaClient,
  addressId: number,
  companyId: number,
  addressType: AddressType,
): Promise<{ canSet: boolean; reason?: string }> => {
  const address = await prisma.companyAddress.findUnique({
    where: { id: addressId },
  });

  if (!address) return { canSet: false, reason: "Indirizzo non trovato" };
  if (address.companyId !== companyId)
    return {
      canSet: false,
      reason: "Indirizzo non appartiene a questa company",
    };
  if (address.addressType !== addressType)
    return {
      canSet: false,
      reason: `Tipo indirizzo diverso da ${addressType}`,
    };

  return { canSet: true };
};

/**
 * Rimuove il flag isPrimary da tutti gli altri indirizzi dello stesso tipo
 *
 * @param prisma - Prisma Client instance
 * @param companyId - ID della company
 * @param addressType - Tipo indirizzo (LEGAL, BILLING, etc)
 * @param excludeId - ID indirizzo da escludere (opzionale)
 */
export const clearPrimaryAddresses = async (
  prisma: PrismaClient,
  companyId: number,
  addressType: string,
  excludeId?: number,
) => {
  // WHERE clause: tutti gli indirizzi PRIMARY dello stesso tipo
  // TRANNE quello che stiamo impostando
  const where: any = {
    companyId,
    addressType,
    isPrimary: true,
  };

  // Se abbiamo un ID da escludere, aggiungilo al where
  if (excludeId) {
    where.id = { not: excludeId };
  }

  // Imposta isPrimary = false su tutti gli altri
  return prisma.companyAddress.updateMany({
    where,
    data: {
      isPrimary: false,
    },
  });
};

/** Union type che accetta sia il client globale sia un transaction client. */
type PrismaClientOrTx = PrismaClient | Prisma.TransactionClient;

const PREFIX_MAP: Record<string, string> = {
  lead: "LEA",
  prospect: "PRO",
  customer: "CLI",
  partner: "PAR",
  supplier: "SUP",
};

/**
 * Generates a unique sequential company code based on entity type.
 * Accepts an optional Prisma transaction client to participate in
 * a broader transaction and avoid race conditions.
 *
 * Format: PREFIX-NNNN (e.g. CLI-0001, SUP-0042)
 * Padding grows automatically beyond 9999 (e.g. CLI-10000).
 *
 * @param type - Entity type key (customer, supplier, lead, prospect, partner)
 * @param tx   - Optional Prisma transaction client (defaults to global client)
 * @returns    - Unique formatted company code string
 * @throws     - Error if the type key is not recognized
 */
export const generateUniqueCompanyCode = async (
  type: string,
  tx: PrismaClientOrTx = prismaGlobal,
): Promise<string> => {
  const prefix = PREFIX_MAP[type.toLowerCase()];

  if (!prefix) {
    throw new Error(
      `Tipo di azienda non valido: "${type}". Valori accettati: ${Object.keys(PREFIX_MAP).join(", ")}`,
    );
  }

  // Ordine numerico via CAST — evita il bug lessicografico di _max su stringhe
  // (es. "CLI-9999" > "CLI-10000" in ordine lessicografico).
  // La regex esclude codici malformati dall'aggregazione.
  const result = await (tx as PrismaClient).$queryRaw<[{ max_num: number | null }]>`
    SELECT MAX(CAST(SPLIT_PART(code, '-', 2) AS INTEGER)) AS max_num
    FROM "Company"
    WHERE code LIKE ${`${prefix}-%`}
      AND code ~ ${`^${prefix}-[0-9]+$`}
  `;

  const maxNum = result[0]?.max_num ?? 0;
  const nextNumber = maxNum + 1;

  // padStart(4) garantisce minimo 4 cifre — si espande automaticamente oltre 9999
  const padded = String(nextNumber).padStart(4, "0");

  return `${prefix}-${padded}`;
};

/**
 * Verifica che ci sia al massimo un indirizzo primary per tipo
 */
export const validatePrimaryAddress = async (
  prisma: PrismaClient,
  companyId: number,
  addressType: AddressType,
): Promise<{ valid: boolean; error?: string }> => {
  const primaryCount = await prisma.companyAddress.count({
    where: {
      companyId,
      addressType,
      isPrimary: true,
    },
  });

  if (primaryCount > 1) {
    return {
      valid: false,
      error: `Trovati ${primaryCount} indirizzi primary per tipo ${addressType}`,
    };
  }

  return { valid: true };
};

/**
 * Imposta un indirizzo come primario in modo atomico
 * Rimuove il flag dagli altri in una transazione
 */
export const setPrimaryAddressAtomic = async (prisma: PrismaClient, addressId: number) => {
  // Prima recupera l'indirizzo
  const address = await prisma.companyAddress.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new Error("Indirizzo non trovato");
  }

  // Esegui in transazione
  return prisma.$transaction(async (tx) => {
    // 1. Rimuovi flag primary da tutti gli altri
    await tx.companyAddress.updateMany({
      where: {
        companyId: address.companyId,
        addressType: address.addressType,
        isPrimary: true,
        id: { not: addressId },
      },
      data: {
        isPrimary: false,
      },
    });

    // 2. Imposta questo come primary
    return tx.companyAddress.update({
      where: { id: addressId },
      data: { isPrimary: true },
    });
  });
};
