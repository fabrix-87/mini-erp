import type { CompanyFormValues, CompanyType } from "@/types/company-types";
import {
  AddressType,
  CompanyStatus,
  CompanyTypeEntity,
  CreateCompanyInput,
  CreateCustomerInput,
  CreateSupplierInput,
  CreditCheckStatus,
  CustomerPriority,
  CustomerSegment,
  CustomerSize,
  CustomerType,
  Decimal,
  UpdateCustomerCompanyInput,
  UpdateCustomerInput,
  UpdateSupplierCompanyInput,
  UpdateSupplierInput,
} from "@mini-erp/shared";
import {
  CreateCompanyForm,
  CreateCustomerForm,
  CreateSupplierForm,
  Customer,
  Supplier,
} from "@mini-erp/shared/types";

// ============================================================================
// API → FORM
// ============================================================================

/**
 * Maps API response data (Customer | Supplier) to CompanyFormValues shape.
 * Extracts nested company fields and type-specific fields into a flat form object.
 */
export function mapApiToForm(data: Customer, type: "CUSTOMER"): CompanyFormValues;
export function mapApiToForm(data: Supplier, type: "SUPPLIER"): CompanyFormValues;
export function mapApiToForm(data: Customer | Supplier, type: CompanyType): CompanyFormValues {
  const company = data.company;

  const base: CompanyFormValues = {
    // Dati base company
    companyName: company.companyName ?? "",
    tradeName: company.tradeName ?? null,
    legalForm: company.legalForm ?? null,
    status: company.status ?? CompanyStatus.ACTIVE,
    entityType: company.entityType ?? CompanyTypeEntity.JURIDICAL,
    vatNumber: company.vatNumber ?? "",
    taxCode: company.taxCode ?? "",
    sdiCode: company.sdiCode ?? "",
    pec: company.pec ?? null,
    vatId: company.vatId ?? null,
    eoriNumber: company.eoriNumber ?? null,
    countryCode: company.countryCode ?? "IT",
    mainEmail: company.mainEmail ?? null,
    mainPhone: company.mainPhone ?? null,
    assignedUserId: company.assignedUserId ?? null,
    customFields: company.customFields ?? null,

    // Mappa legalAddress dalla response API
    legalAddress: {
      address: company.legalAddress.address ?? "",
      city: company.legalAddress.city ?? "",
      provinceCode: company.legalAddress.provinceCode ?? "",
      zipCode: company.legalAddress.zipCode ?? "",
      countryCode: company.legalAddress.countryCode ?? "IT",
      addressType: AddressType.LEGAL,
      isPrimary: true,
      phone: company.legalAddress.phone ?? "",
      latitude: null,
      longitude: null,
      openingHours: null,
      notes: "",
    },

    // Campi customer (default — sovrascritti sotto se type === CUSTOMER)
    parentCustomerId: null,
    priority: CustomerPriority.MEDIUM,
    segment: CustomerSegment.STANDARD,
    size: CustomerSize.SMALL,
    type: CustomerType.CUSTOMER,
    creditStatus: CreditCheckStatus.PENDING,
    defaultPriceListId: null,
    customerTaxRuleId: null,
    paymentMethodId: null,

    // Campi supplier (default — sovrascritti sotto se type === SUPPLIER)
    parentSupplierId: null,
    leadTimeDays: 0,
    transportCost: null,
    rating: 5,
    supplierTaxRuleId: null,

    // creditLimit presente su entrambi
    creditLimit: null,
  };

  if (type === "CUSTOMER") {
    const c = data as Customer;
    return {
      ...base,
      parentCustomerId: c.parentCustomerId ?? null,
      priority: c.priority ?? CustomerPriority.MEDIUM,
      segment: c.segment ?? CustomerSegment.STANDARD,
      size: c.size ?? CustomerSize.SMALL,
      type: c.type ?? CustomerType.CUSTOMER,
      creditStatus: c.creditStatus ?? CreditCheckStatus.PENDING,
      defaultPriceListId: c.defaultPriceListId ?? null,
      customerTaxRuleId: c.customerTaxRuleId ?? null,
      paymentMethodId: c.paymentMethodId ?? null,
      creditLimit: c.creditLimit != null ? Number(c.creditLimit) : null,
    };
  }

  const s = data as Supplier;
  return {
    ...base,
    parentSupplierId: s.parentSupplierId ?? null,
    leadTimeDays: s.leadTimeDays ?? 0,
    transportCost: s.transportCost ?? null,
    supplierTaxRuleId: s.supplierTaxRuleId ?? null,
    rating: s.rating ?? 5,
    creditLimit: s.creditLimit != null ? Number(s.creditLimit) : null,
  };
}

// ============================================================================
// FORM → API
// ============================================================================

/**
 * Extracts company fields from form data and maps them to CompanyInput.
 * Converts legalAddress to the nested addresses array expected by the API.
 */
export function extractCompanyData(data: CompanyFormValues): CreateCompanyInput {
  return {
    companyName: data.companyName,
    tradeName: data.tradeName,
    legalForm: data.legalForm,
    status: data.status ?? CompanyStatus.ACTIVE,
    entityType: data.entityType ?? CompanyTypeEntity.JURIDICAL,
    countryCode: data.countryCode ?? "IT",
    vatNumber: data.vatNumber,
    taxCode: data.taxCode,
    sdiCode: data.sdiCode,
    pec: data.pec,
    vatId: data.vatId,
    eoriNumber: data.eoriNumber,
    mainEmail: data.mainEmail,
    mainPhone: data.mainPhone,
    assignedUserId: data.assignedUserId ?? undefined,
    customFields: data.customFields,
    legalAddress: data.legalAddress,
  };
}

/**
 * Extracts customer-specific fields from form data.
 */
export function extractCustomerData(data: CompanyFormValues): Omit<CreateCustomerInput, "company"> {
  return {
    parentCustomerId: data.parentCustomerId,
    priority: data.priority,
    segment: data.segment,
    size: data.size,
    type: data.type,
    creditStatus: data.creditStatus,
    defaultPriceListId: data.defaultPriceListId,
    customerTaxRuleId: data.customerTaxRuleId,
    paymentMethodId: data.paymentMethodId,
    creditLimit: data.creditLimit != null ? new Decimal(data.creditLimit) : null,
  };
}

/**
 * Extracts supplier-specific fields from form data.
 */
export function extractSupplierData(data: CompanyFormValues): Omit<CreateSupplierForm, "company"> {
  return {
    parentSupplierId: data.parentSupplierId,
    leadTimeDays: data.leadTimeDays ?? 0,
    transportCost: toNumber(data.transportCost),
    rating: data.rating ?? 5,
    creditLimit: toNumber(data.creditLimit),
    supplierTaxRuleId: data.supplierTaxRuleId ?? null,
  };
}

/**
 * Maps form data to the create API payload.
 * Overloaded to return the correct type based on CompanyType.
 */
export function mapFormToCreateApi(data: CompanyFormValues, type: "CUSTOMER"): CreateCustomerInput;
export function mapFormToCreateApi(data: CompanyFormValues, type: "SUPPLIER"): CreateSupplierForm;
export function mapFormToCreateApi(
  data: CompanyFormValues,
  type: CompanyType,
): CreateCustomerInput | CreateSupplierForm {
  const company = extractCompanyData(data);

  if (type === "CUSTOMER") {
    return { company, ...extractCustomerData(data) };
  }
  return { company, ...extractSupplierData(data) };
}

/**
 * Maps form data to the update API payload for company fields only.
 * Addresses are managed via dedicated /addresses endpoints.
 */
export function mapFormToUpdateCompanyApi(
  data: CompanyFormValues,
): UpdateCustomerCompanyInput | UpdateSupplierCompanyInput {
  return extractCompanyData(data);
}

const toNumber = (val: unknown): number | null => {
  if (val == null) return null;
  const n = Number(val); // funziona con string, number e Decimal.js
  return isNaN(n) ? null : n;
};
