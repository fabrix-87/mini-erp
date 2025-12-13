// lib/utils/company-mapper.ts

import { CompanyFormData, CompanyType } from "@/types/company";
import { Customer } from "@/types/customer";
import { Supplier } from "@/types/supplier";

/**
 * Mappa i dati API (Customer o Supplier) al formato del form
 */
export function mapApiToForm(
  data: Customer | Supplier,
  type: CompanyType
): CompanyFormData {
  // Accedi ai dati company nested
  const company = (data as any).company;

  const baseData: CompanyFormData = {
    companyName: company?.companyName || "",
    tradeName: company?.tradeName || "",
    legalForm: company?.legalForm || "",
    entityType: company?.entityType || "JURIDICAL",
    status: company?.status || "ACTIVE",
    vatNumber: company?.vatNumber || "",
    taxCode: company?.taxCode || "",
    sdiCode: company?.sdiCode || "",
    pec: company?.pec || "",
    eoriNumber: company?.eoriNumber || "",
    vatId: company?.vatId || "",
    countryCode: company?.countryCode || "IT",
    mainEmail: company?.mainEmail || "",
    mainPhone: company?.mainPhone || "",
    customFields: company?.customFields,
    legalAddressId: company?.legalAddressId,
    creditLimit: company?.creditLimit || 0,
  };

  // Mappa l'indirizzo legale se presente
  // Nota: legalAddress può essere null o un oggetto Address
  if (company?.legalAddress) {
    baseData.legalAddress = {
      address: company.legalAddress.address || "",
      city: company.legalAddress.city || "",
      provinceCode: company.legalAddress.provinceCode || "",
      zipCode: company.legalAddress.zipCode || "",
      countryCode: company.legalAddress.countryCode || "IT",
    };
  }

  if (type === "CUSTOMER") {
    const customer = data as Customer;
    return {
      ...baseData,
      priority: customer.priority || "MEDIUM",
      segment: customer.segment || "STANDARD",
      leadStatus: customer.leadStatus || "NEW",
      size: customer.size || "SMALL",
      type: customer.type || "LEAD",
      creditStatus: customer.creditStatus || "PENDING",
      creditLimit: customer.creditLimit || 0,
      totalSales: customer.totalSales || 0,
      totalRevenue: customer.totalRevenue || "0",
    };
  } else {
    const supplier = data as Supplier;
    return {
      ...baseData,
      paymentTerms: supplier.paymentTerms || "",
      leadTimeDays: supplier.leadTimeDays || 0,
      rating: supplier.rating || 5,
      creditLimit: supplier.creditLimit || 0,
      totalOrders: supplier.totalOrders || 0,
      totalSpent: supplier.totalSpent || "0",
    };
  }
}

/**
 * Estrae i dati della Company dal form
 */
export function extractCompanyData(data: CompanyFormData) {
  return {
    companyName: data.companyName,
    tradeName: data.tradeName,
    legalForm: data.legalForm,
    entityType: data.entityType,
    status: data.status,
    vatNumber: data.vatNumber,
    taxCode: data.taxCode,
    sdiCode: data.sdiCode,
    pec: data.pec,
    eoriNumber: data.eoriNumber,
    vatId: data.vatId,
    countryCode: data.countryCode,
    mainEmail: data.mainEmail,
    mainPhone: data.mainPhone,
    customFields: data.customFields,
    legalAddressId: data.legalAddressId,
  };
}

/**
 * Estrae i dati specifici del Customer
 */
export function extractCustomerData(data: CompanyFormData) {
  return {
    priority: data.priority,
    segment: data.segment,
    leadStatus: data.leadStatus,
    size: data.size,
    type: data.type,
    creditStatus: data.creditStatus,
    creditLimit: data.creditLimit,
  };
}

/**
 * Estrae i dati specifici del Supplier
 */
export function extractSupplierData(data: CompanyFormData) {
  return {
    paymentTerms: data.paymentTerms,
    leadTimeDays: data.leadTimeDays,
    rating: data.rating,
    creditLimit: data.creditLimit,
  };
}

/**
 * Mappa i dati del form per la creazione (include company nested)
 */
export function mapFormToCreateApi(
  data: CompanyFormData,
  type: CompanyType
): Partial<Customer | Supplier> {
  const companyData = extractCompanyData(data);

  if (type === "CUSTOMER") {
    return {
      company: companyData,
      ...extractCustomerData(data),
    } as Partial<Customer>;
  } else {
    return {
      company: companyData,
      ...extractSupplierData(data),
    } as Partial<Supplier>;
  }
}

/**
 * Valida i dati obbligatori del form
 */
export function validateCompanyForm(data: CompanyFormData): string[] {
  const errors: string[] = [];

  if (!data.companyName?.trim()) {
    errors.push("La ragione sociale è obbligatoria");
  }

  if (!data.entityType) {
    errors.push("Il tipo di entità è obbligatorio");
  }

  if (!data.countryCode || data.countryCode.length !== 2) {
    errors.push("Il codice paese deve essere di 2 caratteri");
  }

  // Validazioni specifiche per tipo
  if (data.vatNumber && !/^[A-Z]{2}\d{11}$/.test(data.vatNumber)) {
    errors.push("Formato Partita IVA non valido (es: IT12345678901)");
  }

  if (data.taxCode && data.entityType === "JURIDICAL" && !/^\d{11}$/.test(data.taxCode)) {
    errors.push("Formato Codice Fiscale non valido per persona giuridica");
  }

  if (data.sdiCode && data.sdiCode.length !== 7) {
    errors.push("Il codice SDI deve essere di 7 caratteri");
  }

  if (data.mainEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.mainEmail)) {
    errors.push("Formato email non valido");
  }

  return errors;
}
