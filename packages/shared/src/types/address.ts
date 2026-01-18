// Tipi ENUM
export type AddressType = 'LEGAL' | 'BILLING' | 'SHIPPING' | 'OFFICE' | 'WAREHOUSE' | 'OTHER';

export type Address = {
  id: number;
  companyId: number;
  
  // Classificazione
  addressType: AddressType;
  //alias?: string | null;
  
  // Dati Indirizzo
  address: string;
  city: string;
  zipCode: string;
  provinceCode?: string;
  //region?: string ;
  //country: string; // Nome completo o codice lungo
  countryCode?: string | null; // Codice ISO 3166-1 alpha-2

  // Coordinate geografiche
  latitude?: number | null;
  longitude?: number | null;
  
  // Flags
  isPrimary: boolean;
  //active: boolean;
  //isVerified: boolean;
  
  // Info Contatto Specifiche
  phone?: string;
  //contactPhone?: string | null;
  //contactEmail?: string | null;

  // Logistica
  //deliveryNotes?: string | null;
  openingHours?: Record<string, any> | null; // JSON
  //shippingZone?: string | null;
  //additionalShippingCost?: number;
  
  // Note e Metadata
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}