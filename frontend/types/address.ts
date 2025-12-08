// Tipi ENUM
export type AddressType = 'billing' | 'shipping' | 'legal' | 'operational' | 'warehouse' | 'other';

export interface Address {
  id: number;
  companyId: number;
  
  // Classificazione
  addressType: AddressType;
  alias?: string | null;
  
  // Dati Indirizzo
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postalCode: string;
  province?: string | null;
  region?: string | null;
  country: string; // Nome completo o codice lungo
  countryCode?: string | null; // Codice ISO 3166-1 alpha-2

  // Coordinate geografiche
  latitude?: number | null;
  longitude?: number | null;
  
  // Flags
  isDefault: boolean;
  active: boolean;
  isVerified: boolean;
  
  // Info Contatto Specifiche
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;

  // Logistica
  deliveryNotes?: string | null;
  openingHours?: Record<string, any> | null; // JSON
  shippingZone?: string | null;
  additionalShippingCost?: number;
  
  // Note e Metadata
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Interfaccia per l'oggetto 'shippingAddress' utilizzato nel DTO e nel Joi validator
// (È solo un sottoinsieme dei campi salvati come snapshot sul Documento)
export interface ShippingAddressDTO {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  province?: string | null;
  country?: string | null; // Codice ISO 2-lettere (come definito nel validator)
}