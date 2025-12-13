import { prisma as prismaGlobal } from "../config/prisma-client";
import { Prisma, PrismaClient } from "../generated/prisma/client";

import {
  CompanyFilters,
  CustomerFilters,
  SupplierFilters,
  AddressFilters,
} from "../types/company";
import { AddressType } from "../validators/address"; 

// ============================================================================
// WHERE CLAUSE BUILDERS
// ============================================================================

/**
 * Costruisce WHERE clause per Company
 */
export const buildCompanyWhereClause = (
  filters: CompanyFilters
): Prisma.CompanyWhereInput => {
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
export const buildCustomerWhereClause = (
  filters: CustomerFilters
): Prisma.CustomerWhereInput => {
  const where: Prisma.CustomerWhereInput = {
    company: buildCompanyWhereClause(filters),
  };

  if (filters.type) where.type = filters.type as any;
  if (filters.priority) where.priority = filters.priority as any;
  if (filters.segment) where.segment = filters.segment as any;
  if (filters.leadStatus) where.leadStatus = filters.leadStatus as any;
  if (filters.creditStatus) where.creditStatus = filters.creditStatus as any;

  return where;
};

/**
 * Costruisce WHERE clause per Supplier
 */
export const buildSupplierWhereClause = (
  filters: SupplierFilters
): Prisma.SupplierWhereInput => {
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
  filters: AddressFilters
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
    legalAddress: {
      include: { country: true },
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
  ...getCompanyBaseInclude(),
  addresses: {
    include: { country: true },
    orderBy: { isPrimary: "desc" as const },
  },
  contacts: {
    where: { active: true },
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

export const getCustomerInclude = (detailed = false) => ({
  company: {
    include: detailed ? getCompanyFullInclude() : getCompanyBaseInclude(),
  },
  defaultPriceList: detailed
    ? {
        select: { id: true, code: true, name: true, currency: true },
      }
    : undefined,
  customerTaxRule: detailed
    ? {
        select: { id: true, code: true, name: true },
      }
    : undefined,
  paymentMethod: detailed
    ? {
        include: { translations: true },
      }
    : undefined,
  _count: detailed
    ? {
        select: { documentsOut: true, opportunities: true },
      }
    : undefined,
});

export const getSupplierInclude = (detailed = false) => ({
  company: {
    include: detailed ? getCompanyFullInclude() : getCompanyBaseInclude(),
  },
  _count: detailed
    ? {
        select: { documentsIn: true, products: true },
      }
    : undefined,
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
  sortOrder: "asc" | "desc" = "desc"
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

export const buildPagination = (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
};

// ============================================================================
// ASYNC DB HELPERS
// ============================================================================

/**
 * Genera codice company univoco (Richiede accesso DB)
 */
export const generateCompanyCode = async (
  prisma: any, // Idealmente tipizzare con PrismaClient
  prefix = "COM"
): Promise<string> => {
  const lastCompany = await prisma.company.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { id: "desc" },
    select: { code: true },
  });

  let nextNumber = 1;
  if (lastCompany?.code) {
    const match = lastCompany.code.match(/\d+$/);
    if (match) nextNumber = parseInt(match[0]) + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(6, "0")}`;
};

/**
 * Verifica se può eliminare company
 */
export const canDeleteCompany = async (
  prisma: any,
  companyId: number
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
    company._count.documents +
    company._count.customers +
    company._count.suppliers;

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
  prisma: any,
  addressId: number,
  companyId: number,
  addressType: string
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
  excludeId?: number
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

/**
 * Genera un codice univoco per l'azienda basato sul tipo.
 * Accetta un'istanza prisma opzionale per supportare le transazioni.
 */
export const generateUniqueCompanyCode = async (
  type: string,
  tx: PrismaClient = prismaGlobal // Usa il client globale se non viene passata una transazione
): Promise<string> => {
  const prefixMap: { [key: string]: string } = {
    lead: "LEA",
    prospect: "PRO",
    customer: "CLI",
    partner: "PAR",
    supplier: "SUP",
  };

  const typeLower = type.toLowerCase();
  const prefix = prefixMap[typeLower];

  if (!prefix) {
    throw new Error(`Tipo di azienda non valido: ${type}`);
  }

  // Cerchiamo il codice più alto che inizia con il prefisso
  const lastCompany = await tx.company.findFirst({
    where: {
      code: {
        startsWith: `${prefix}-`,
      },
    },
    orderBy: { code: "desc" },
    select: { code: true },
  });

  let newNumber = 1;

  if (lastCompany && lastCompany.code) {
    // Estrae la parte numerica finale
    const match = lastCompany.code.match(/(\d+)$/);
    if (match && match[1]) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Pad a 4 cifre (o più se il numero cresce)
  // Es: 1 -> "0001", 12 -> "0012"
  const newNumberPadded = String(newNumber).padStart(4, "0");

  return `${prefix}-${newNumberPadded}`;
};

/**
 * Verifica che ci sia al massimo un indirizzo primary per tipo
 */
export const validatePrimaryAddress = async (
  prisma: PrismaClient,
  companyId: number,
  addressType: AddressType
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
export const setPrimaryAddressAtomic = async (
  prisma: PrismaClient,
  addressId: number
) => {
  // Prima recupera l'indirizzo
  const address = await prisma.companyAddress.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new Error('Indirizzo non trovato');
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