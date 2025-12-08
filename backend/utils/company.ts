import { ValidationResult } from '../types/company'

// ============================================================================
// VALIDATION UTILS
// ============================================================================

/**
 * Valida Partita IVA Italiana
 */
export const validateItalianVAT = (vat: string): boolean => {
  if (!vat || vat.length !== 11) return false;
  return /^\d{11}$/.test(vat);
};

/**
 * Valida Codice Fiscale Italiano
 */
export const validateItalianTaxCode = (taxCode: string): boolean => {
  if (!taxCode || taxCode.length !== 16) return false;
  return /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(taxCode);
};

/**
 * Valida SDI Code
 */
export const validateSDICode = (sdiCode: string): boolean => {
  if (!sdiCode) return false;
  return /^[A-Z0-9]{7}$/.test(sdiCode);
};

/**
 * Valida PEC Email
 */
export const validatePEC = (pec: string): boolean => {
  if (!pec) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(pec);
};

/**
 * Verifica coerenza dati fiscali
 */
export const validateFiscalData = (data: {
  entityType: string;
  countryCode: string;
  vatNumber?: string | null;
  taxCode?: string | null;
  sdiCode?: string | null;
  pec?: string | null;
}): ValidationResult => {
  const errors: string[] = [];

  // Per Italia
  if (data.countryCode === 'IT') {
    // Persona Giuridica deve avere P.IVA
    if (data.entityType === 'JURIDICAL' && !data.vatNumber) {
      errors.push('Persona Giuridica italiana richiede Partita IVA');
    }

    // Valida P.IVA se presente
    if (data.vatNumber && !validateItalianVAT(data.vatNumber)) {
      errors.push('Partita IVA non valida');
    }

    // Valida CF se presente
    if (data.taxCode && !validateItalianTaxCode(data.taxCode)) {
      errors.push('Codice Fiscale non valido');
    }

    // SDI o PEC obbligatori per fatturazione elettronica
    if (!data.sdiCode && !data.pec) {
      errors.push('Codice SDI o PEC obbligatorio per fatturazione elettronica');
    }

    // Valida SDI se presente
    if (data.sdiCode && !validateSDICode(data.sdiCode)) {
      errors.push('Codice SDI non valido');
    }

    // Valida PEC se presente
    if (data.pec && !validatePEC(data.pec)) {
      errors.push('Indirizzo PEC non valido');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// FORMATTING & CALCULATION UTILS
// ============================================================================

/**
 * Normalizza dati indirizzo
 */
export const normalizeAddress = (address: string): string => {
  return address
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Formatta nome company per display
 */
export const formatCompanyName = (company: {
  companyName: string;
  tradeName?: string | null;
}): string => {
  if (company.tradeName) {
    return `${company.companyName} (${company.tradeName})`;
  }
  return company.companyName;
};

/**
 * Calcola statistiche customer
 */
export const calculateCustomerStats = (customer: any) => ({
  totalOrders: customer._count?.documentsOut || 0,
  totalRevenue: customer.totalRevenue || 0,
  averageOrderValue: customer._count?.documentsOut > 0
    ? customer.totalRevenue / customer._count.documentsOut
    : 0,
  daysSinceFirstSale: customer.firstSaleDate
    ? Math.floor((Date.now() - new Date(customer.firstSaleDate).getTime()) / (1000 * 60 * 60 * 24))
    : null,
  daysSinceLastSale: customer.lastSaleDate
    ? Math.floor((Date.now() - new Date(customer.lastSaleDate).getTime()) / (1000 * 60 * 60 * 24))
    : null,
});

/**
 * Calcola statistiche supplier
 */
export const calculateSupplierStats = (supplier: any) => ({
  totalOrders: supplier._count?.documentsIn || 0,
  totalSpent: supplier.totalSpent || 0,
  averageOrderValue: supplier._count?.documentsIn > 0
    ? supplier.totalSpent / supplier._count.documentsIn
    : 0,
  productsSupplied: supplier._count?.products || 0,
  rating: supplier.rating || 0,
});

/**
 * Formatta risposta paginata
 */
export const formatPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => ({
  success: true,
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
});