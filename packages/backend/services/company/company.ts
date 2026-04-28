// ============================================================================
// PRISMA DATA BUILDERS
// ============================================================================

import { Prisma } from "@/generated/prisma/client";
import { connectOrDisconnectById, parseOptionalDecimal, toJsonField } from "@/helpers/prisma";
import {
  CreateCompanyInput,
  CreateCustomerInput,
  CreateNestedAddressInput,
  CreateSupplierInput,
  UpdateCompanyInput,
  UpdateCustomerInput,
  UpdateSupplierInput,
} from "@mini-erp/shared";

/**
 * Builds Prisma-compatible data for CompanyAddress creation.
 * Uses UncheckedCreateWithoutCompanyInput to keep FK scalars (countryCode)
 * while omitting companyId (injected automatically in nested writes).
 */
export const buildAddressCreateData = (
  address: CreateNestedAddressInput,
  overrides?: Partial<Prisma.CompanyAddressUncheckedCreateWithoutCompanyInput>,
): Prisma.CompanyAddressUncheckedCreateWithoutCompanyInput => ({
  address: address.address,
  city: address.city,
  zipCode: address.zipCode,
  countryCode: address.countryCode,
  addressType: address.addressType,
  isPrimary: address.isPrimary ?? false,
  provinceCode: address.provinceCode ?? undefined,
  phone: address.phone ?? undefined,
  notes: address.notes ?? undefined,
  latitude: parseOptionalDecimal(address.latitude) ?? undefined,
  longitude: parseOptionalDecimal(address.longitude) ?? undefined,
  openingHours: toJsonField(address.openingHours),
  ...overrides,
});

/**
 * Builds Prisma-compatible nested `company.create` data.
 * Handles legalAddress as nested create and assignedUserId as connect.
 */
export const buildCompanyCreateData = (
  companyData: CreateCompanyInput,
  code: string,
): Prisma.CompanyCreateInput => {
  const { legalAddress, assignedUserId, customFields, openingHours, ...scalars } = companyData;

  return {
    ...scalars,
    code,
    vatNumber: scalars.vatNumber ?? undefined,
    taxCode: scalars.taxCode ?? undefined,
    sdiCode: scalars.sdiCode ?? undefined,
    pec: scalars.pec ?? undefined,
    tradeName: scalars.tradeName ?? undefined,
    legalForm: scalars.legalForm ?? undefined,
    mainEmail: scalars.mainEmail ?? undefined,
    mainPhone: scalars.mainPhone ?? undefined,
    vatId: scalars.vatId ?? undefined,
    eoriNumber: scalars.eoriNumber ?? undefined,
    customFields: toJsonField(customFields),

    user: connectOrDisconnectById(assignedUserId),
    ...(legalAddress && {
      addresses: {
        create: buildAddressCreateData(legalAddress, {
          addressType: "LEGAL",
          isPrimary: true,
        }),
      },
    }),
  };
};

/**
 * Builds Prisma-compatible data for Company update.
 * Only includes fields that are explicitly provided (undefined = skip).
 */
export const buildCompanyUpdateData = (
  companyData: UpdateCompanyInput,
): Prisma.CompanyUpdateInput => {
  const { assignedUserId, customFields, openingHours, ...scalars } = companyData;

  return {
    ...scalars,
    user: connectOrDisconnectById(assignedUserId),
    customFields: customFields !== undefined ? toJsonField(customFields) : undefined,
  };
};

/**
 * Builds Prisma-compatible data for Customer creation (nested write).
 * Uses CustomerCreateInput (relational) — no FK directs allowed.
 */
export const buildCustomerCreateData = (
  customerData: Omit<CreateCustomerInput, "company">,
  companyCreate: Prisma.CompanyCreateInput,
): Prisma.CustomerCreateInput => ({
  priority: customerData.priority,
  segment: customerData.segment ?? undefined,
  size: customerData.size ?? undefined,
  type: customerData.type ?? undefined,
  creditStatus: customerData.creditStatus ?? undefined,
  creditLimit: parseOptionalDecimal(customerData.creditLimit) ?? undefined,
  parentCustomer: connectOrDisconnectById(customerData.parentCustomerId),
  defaultPriceList: connectOrDisconnectById(customerData.defaultPriceListId),
  customerTaxRule: connectOrDisconnectById(customerData.customerTaxRuleId),
  paymentMethod: connectOrDisconnectById(customerData.paymentMethodId),
  company: { create: companyCreate },
});

/**
 * Builds Prisma-compatible data for Customer update.
 */
export const buildCustomerUpdateData = (data: UpdateCustomerInput): Prisma.CustomerUpdateInput => ({
  priority: data.priority ?? undefined,
  segment: data.segment ?? undefined,
  size: data.size ?? undefined,
  type: data.type ?? undefined,
  creditStatus: data.creditStatus ?? undefined,
  creditLimit: parseOptionalDecimal(data.creditLimit) ?? undefined,
  parentCustomer: connectOrDisconnectById(data.parentCustomerId),
  defaultPriceList: connectOrDisconnectById(data.defaultPriceListId),
  customerTaxRule: connectOrDisconnectById(data.customerTaxRuleId),
  paymentMethod: connectOrDisconnectById(data.paymentMethodId),
});

/**
 * Builds Prisma-compatible data for Supplier creation (nested write).
 */
export const buildSupplierCreateData = (
  supplierData: Omit<CreateSupplierInput, "company">,
  companyCreate: Prisma.CompanyCreateInput,
): Prisma.SupplierCreateInput => ({
  rating: supplierData.rating ?? undefined,
  paymentTerms: supplierData.paymentTerms ?? undefined,
  parentSupplier: connectOrDisconnectById(supplierData.parentSupplierId),
  supplierTaxRule: connectOrDisconnectById(supplierData.supplierTaxRuleId),
  company: { create: companyCreate },
});

/**
 * Builds Prisma-compatible data for Supplier update.
 */
export const buildSupplierUpdateData = (data: UpdateSupplierInput): Prisma.SupplierUpdateInput => ({
  rating: data.rating ?? undefined,
  paymentTerms: data.paymentTerms ?? undefined,
  parentSupplier: connectOrDisconnectById(data.parentSupplierId),
  supplierTaxRule: connectOrDisconnectById(data.supplierTaxRuleId),
});
