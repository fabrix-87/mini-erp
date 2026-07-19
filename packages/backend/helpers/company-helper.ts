// helpers/company-helper.ts
import { PrismaClientOrTx } from "@/types/prisma-types";
import { prisma as prismaGlobal } from "../config/prisma-config";
import {
  AddressType,
  CompanyStatus,
  CustomerType,
  CustomerPriority,
  CustomerSegment,
  Prisma,
  PrismaClient,
  CompanyTypeEntity,
  CreditCheckStatus,
} from "../generated/prisma/client";
import {
  AddressFilters,
  COMPANY_CODE_PREFIX_MAP,
  CompanyFilters,
  CompanySortField,
  CustomerFilters,
  SupplierFilters,
} from "@mini-erp/shared";
import { tenantFilter } from "./prisma-helper";
import { AddressUpsertInput, upsertLegalAddress } from "./address-helper";
import { storicizeCompany, syncCurrentVersion } from "./company-version-helper";

// ============================================================================
// WHERE CLAUSE BUILDERS
// ============================================================================

/**
 * Builds a Prisma WHERE clause for Company queries.
 * All filter fields are optional; undefined values are ignored.
 *
 * @param filters - CompanyFilters object from query params
 * @param tenantId - Tenant ID from the authenticated request context
 */
export const buildCompanyWhereClause = (
  filters: CompanyFilters,
  tenantId: string,
): Prisma.CompanyWhereInput => {
  const where: Prisma.CompanyWhereInput = { tenantId };

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

  if (filters.status) where.status = filters.status as CompanyStatus;
  if (filters.entityType) where.entityType = filters.entityType as CompanyTypeEntity;
  if (filters.countryCode) where.countryCode = filters.countryCode;
  if (filters.assignedUserId) where.assignedUserId = filters.assignedUserId;

  return where;
};

/**
 * Builds a Prisma WHERE clause for Customer queries.
 * Composes buildCompanyWhereClause for shared company-level filters.
 *
 * @param filters - CustomerFilters object from query params
 * @param tenantId - Tenant ID from the authenticated request context
 */
export const buildCustomerWhereClause = (
  filters: CustomerFilters,
  tenantId: string,
): Prisma.CustomerWhereInput => {
  const where: Prisma.CustomerWhereInput = {
    tenantId,
    company: buildCompanyWhereClause(filters, tenantId),
  };

  if (filters.type) where.type = filters.type as CustomerType;
  if (filters.priority) where.priority = filters.priority as CustomerPriority;
  if (filters.segment) where.segment = filters.segment as CustomerSegment;
  if (filters.creditStatus) where.creditStatus = filters.creditStatus as CreditCheckStatus;
  if (filters.isDeleted !== undefined) {
    where.deletedAt = filters.isDeleted ? { not: null } : null;
  }

  return where;
};

/**
 * Builds a Prisma WHERE clause for Supplier queries.
 *
 * @param filters - SupplierFilters object from query params
 * @param tenantId - Tenant ID from the authenticated request context
 */
export const buildSupplierWhereClause = (
  filters: SupplierFilters,
  tenantId: string,
): Prisma.SupplierWhereInput => {
  const where: Prisma.SupplierWhereInput = {
    tenantId,
    company: buildCompanyWhereClause(filters, tenantId),
  };

  if (filters.minRating !== undefined) {
    where.rating = { gte: filters.minRating };
  }

  if (filters.hasProducts !== undefined) {
    where.products = filters.hasProducts ? { some: {} } : { none: {} };
  }

  if (filters.isDeleted !== undefined) {
    where.deletedAt = filters.isDeleted ? { not: null } : null;
  }

  return where;
};

/**
 * Builds a Prisma WHERE clause for CompanyAddress queries.
 *
 * @param filters - AddressFilters object from query params
 */
export const buildAddressWhereClause = (
  filters: AddressFilters,
): Prisma.CompanyAddressWhereInput => {
  const where: Prisma.CompanyAddressWhereInput = {};

  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.addressType) where.addressType = filters.addressType as AddressType;
  if (filters.countryCode) where.countryCode = filters.countryCode;
  if (filters.isPrimary !== undefined) where.isPrimary = filters.isPrimary;

  return where;
};

// ============================================================================
// ORDER BY BUILDER
// ============================================================================

const ORDER_BY_MAP: Record<CompanySortField, Prisma.CompanyOrderByWithRelationInput> = {
  id: { id: "asc" }, // placeholder, sortOrder applied below
  code: { code: "asc" },
  name: { companyName: "asc" },
  country: { country: { name: "asc" } },
  status: { status: "asc" },
  createdAt: { createdAt: "asc" },
};

/**
 * Builds a typed Prisma orderBy input for Company queries.
 * Falls back to { id: sortOrder } for unrecognized sortBy values.
 *
 * @param sortBy    - Field name to sort by (constrained to CompanySortField)
 * @param sortOrder - Sort direction, defaults to "desc"
 */
export const buildOrderBy = (
  sortBy: CompanySortField = "id",
  sortOrder: Prisma.SortOrder = "desc",
): Prisma.CompanyOrderByWithRelationInput => {
  const base = ORDER_BY_MAP[sortBy] ?? { id: sortOrder };

  // Replace the placeholder asc with the actual sortOrder
  const [key] = Object.keys(base) as [string];
  const value = (base as Record<string, unknown>)[key];

  // Handle nested objects (e.g. country: { name: ... })
  if (typeof value === "object" && value !== null) {
    const [nestedKey] = Object.keys(value as object);
    return { [key]: { [nestedKey]: sortOrder } };
  }

  return { [key]: sortOrder };
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
  } as const;
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
    select: { addresses: true, contacts: true, notes: true },
  },
});

// ============================================================================
// INCLUDE TYPES
// ============================================================================

type CompanyBaseInclude = ReturnType<typeof getCompanyBaseInclude>;
type CompanyFullInclude = ReturnType<typeof getCompanyFullInclude>;

type CustomerDetailedFields = {
  defaultPriceList: { select: { id: true; code: true; name: true; currency: true } };
  customerTaxRule: { select: { id: true; code: true; name: true } };
  paymentMethod: { include: { translations: true } };
  _count: { select: { documentsOut: true; opportunities: true } };
};

type CustomerBaseFields = {
  defaultPriceList: undefined;
  customerTaxRule: undefined;
  paymentMethod: undefined;
  _count: undefined;
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
    company: { include: detailed ? getCompanyFullInclude() : getCompanyBaseInclude() },
    defaultPriceList: detailed
      ? { select: { id: true, code: true, name: true, currency: true } }
      : undefined,
    customerTaxRule: detailed ? { select: { id: true, code: true, name: true } } : undefined,
    paymentMethod: detailed ? { include: { translations: true } } : undefined,
    _count: detailed ? { select: { documentsOut: true, opportunities: true } } : undefined,
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
    company: { include: detailed ? getCompanyFullInclude() : getCompanyBaseInclude() },
    _count: detailed ? { select: { documentsIn: true, products: true } } : undefined,
  };
}

export const getCustomerGroupInclude = () => ({
  parentCustomer: {
    select: { id: true, company: { select: { companyName: true, code: true } } },
  },
  subsidiaries: {
    select: { id: true, company: { select: { companyName: true, code: true } } },
  },
});

export const getSupplierGroupInclude = () => ({
  parentSupplier: {
    select: { id: true, company: { select: { companyName: true, code: true } } },
  },
  subsidiaries: {
    select: { id: true, company: { select: { companyName: true, code: true } } },
  },
});

export const getAddressInclude = () => ({
  country: { select: { code: true, name: true, isEU: true } },
  company: { select: { id: true, code: true, companyName: true } },
});

// ============================================================================
// ASYNC DB HELPERS
// ============================================================================

/**
 * Checks whether a given address can be set as primary for a company and type.
 *
 * @param tx          - Prisma client or transaction client
 * @param addressId   - ID of the address to promote
 * @param companyId   - Expected owner company ID
 * @param addressType - Expected address type
 */
export const canSetPrimaryAddress = async (
  tx: PrismaClientOrTx,
  addressId: string,
  companyId: string,
  addressType: AddressType,
): Promise<{ canSet: boolean; reason?: string }> => {
  const address = await (tx as PrismaClient).companyAddress.findUnique({
    where: { id: addressId },
  });

  if (!address) return { canSet: false, reason: "Indirizzo non trovato" };
  if (address.companyId !== companyId)
    return { canSet: false, reason: "Indirizzo non appartiene a questa company" };
  if (address.addressType !== addressType)
    return { canSet: false, reason: `Tipo indirizzo diverso da ${addressType}` };

  return { canSet: true };
};

/**
 * Atomically promotes an address to primary, clearing any previous primary
 * of the same type within the same company.
 * Performs both operations in a single transaction to prevent inconsistent state.
 *
 * @param tx        - Prisma client or transaction client (wraps own tx if needed)
 * @param addressId - ID of the address to promote
 */
export const setPrimaryAddressAtomic = async (tx: PrismaClientOrTx, addressId: string) => {
  const address = await (tx as PrismaClient).companyAddress.findUnique({
    where: { id: addressId },
  });

  if (!address) throw new Error("Indirizzo non trovato");

  const run = async (innerTx: Prisma.TransactionClient) => {
    await innerTx.companyAddress.updateMany({
      where: {
        companyId: address.companyId,
        addressType: address.addressType,
        isPrimary: true,
        id: { not: addressId },
      },
      data: { isPrimary: false },
    });

    return innerTx.companyAddress.update({
      where: { id: addressId },
      data: { isPrimary: true },
    });
  };

  // Se siamo già dentro una transazione esterna, usarla direttamente
  // Se no, aprire una nuova transazione
  const isAlreadyInTransaction = !("$transaction" in tx);
  return isAlreadyInTransaction
    ? run(tx as Prisma.TransactionClient)
    : (tx as PrismaClient).$transaction(run);
};

// ============================================================================
// CODE GENERATION
// ============================================================================

// ============================================================================
// CODE GENERATION
// ============================================================================

/**
 * Generates a unique sequential company code based on entity type.
 * Uses a raw SQL MAX to avoid lexicographic ordering bugs on string codes.
 * Safe to call inside a Prisma transaction.
 *
 * Format: PREFIX-NNNN (e.g. CLI-0001, SUP-0042).
 * Padding expands automatically beyond 9999 (e.g. CLI-10000).
 *
 * @param type     - Entity type key (customer, supplier, lead, prospect, partner)
 * @param tenantId - Tenant ID from the authenticated request context
 * @param tx       - Optional Prisma transaction client (defaults to global client)
 * @throws         - If the type key is not in COMPANY_CODE_PREFIX_MAP
 */
export const generateUniqueCompanyCode = async (
  type: string,
  tenantId: string,
  tx: PrismaClientOrTx = prismaGlobal,
): Promise<string> => {
  const prefix =
    COMPANY_CODE_PREFIX_MAP[type.toLowerCase() as keyof typeof COMPANY_CODE_PREFIX_MAP];

  if (!prefix) {
    throw new Error(
      `Tipo di azienda non valido: "${type}". Valori accettati: ${Object.keys(COMPANY_CODE_PREFIX_MAP).join(", ")}`,
    );
  }

  const result = await (tx as PrismaClient).$queryRaw<[{ max_num: number | null }]>`
  SELECT MAX(CAST(SPLIT_PART(code, '-', 2) AS INTEGER)) AS max_num
    FROM "companies"
    WHERE code LIKE ${`${prefix}-%`}
      AND tenant_id = ${tenantId}
      AND code ~ ${`^${prefix}-[0-9]+$`}
  `;

  const nextNumber = (result[0]?.max_num ?? 0) + 1;
  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
};

/**
 * Validates that no more than one primary address exists per type for a company.
 * Use as a data integrity check after bulk imports or migrations.
 *
 * @param tx          - Prisma client or transaction client
 * @param companyId   - Company to validate
 * @param addressType - Address type to check
 */
export const validatePrimaryAddress = async (
  tx: PrismaClientOrTx,
  companyId: string,
  addressType: AddressType,
): Promise<{ valid: boolean; error?: string }> => {
  const count = await (tx as PrismaClient).companyAddress.count({
    where: { companyId, addressType, isPrimary: true },
  });

  if (count > 1) {
    return {
      valid: false,
      error: `Trovati ${count} indirizzi primary per tipo ${addressType}`,
    };
  }

  return { valid: true };
};

export interface CompanyUpdateOptions {
  companyId: string;
  tenantId: string;
  userId: string;
  companyScalarData: Prisma.CompanyUpdateInput;
  legalAddress?: AddressUpsertInput;
  storicize?: { reason: string; effectiveDate?: Date };
}

/**
 * Executes a company scalar update + optional legal address upsert +
 * optional historization, all within a single transaction.
 *
 * Shared by updateCustomerCompany and updateSupplierCompany to avoid
 * duplication. The caller is responsible for wrapping this inside
 * prisma.$transaction and providing the tx client.
 *
 * @param tx   - Open Prisma transaction client
 * @param opts - Update options
 */
export async function executeCompanyUpdate(
  tx: Prisma.TransactionClient,
  opts: CompanyUpdateOptions,
): Promise<void> {
  const { companyId, tenantId, userId, companyScalarData, legalAddress, storicize } = opts;

  if (Object.keys(companyScalarData).length > 0) {
    await tx.company.update({ where: { id: companyId }, data: companyScalarData });
  }

  if (legalAddress) {
    await upsertLegalAddress(tx, companyId, legalAddress);
  }

  if (storicize) {
    await storicizeCompany(tx, {
      companyId,
      tenantId,
      userId,
      storicizeReason: storicize.reason,
      effectiveDate: storicize.effectiveDate ? new Date(storicize.effectiveDate) : undefined,
    });
  } else {
    await syncCurrentVersion(tx, companyId, userId);
  }
}
