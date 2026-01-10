// ============ Product Types ============
export interface ProductPreview {
  id: number;
  reference: string;
  name: string;
  price: number
  quantity: number;
  active: boolean;
  supplierId: string;
  coverImage: string;
  shortDescription: string;
  description: string;
  variantCount: number;
}

export interface Product {
  id: number;
  reference: string;
  type: 'variable' | 'simple' | string;
  isbn: string | null;
  upc: string | null;
  gtin: string | null;
  mpn: string | null;
  ean13: string | null;

  active: boolean;
  availableForOrder: boolean;
  showPrice: boolean;
  onlineOnly: boolean;
  onSale: boolean;

  // ATTENZIONE: Questi sono STRINGHE nel tuo JSON
  priceTaxExcluded: string; 
  priceTaxIncluded: string; 
  wholesalePrice: string;
  ecotaxTaxExcluded: string;
  
  // Campi correlati a dimensioni e peso (stringhe)
  width: string;
  height: string;
  depth: string;
  weight: string;

  quantity: number; // Stock disponibile (0 nel tuo esempio)
  minimalQuantity: number;
  
  supplierId: string; // "XINDAO" nel tuo esempio
  
  // Gestione dei redirect
  redirectType: '404' | string; 
  redirectTarget: number;

  createdAt: string;
  updatedAt: string;

  // Dettagli del Prodotto
  images: ProductImage[];
  translations: ProductTranslation[]; // Contiene 'name', 'description', 'shortDescription'
  variants: ProductVariant[];
  attributeGroups: AttributeGroup[];
  
  // Campi che non esistono nel JSON principale:
  // name: string; // Si trova in translations[].name
  // description?: string; // Si trova in translations[].description
  // shortDescription?: string; // Si trova in translations[].shortDescription
  coverImage?: string; 
  // priceRange?: { min: number; max: number; }; // Non presente
  variantCount?: number; 
}

export interface ProductVariant {
  id: number;
  productId: number;
  variantCode: string;
  sku?: string;
  ean13?: string;
  quantity: number;
  // ATTENZIONE: Questi sono STRINGHE nel tuo JSON, non numeri
  priceTaxExcluded: string; 
  wholesalePrice: string | null; // Può essere null
  weight: string;
  width: string;
  height: string;
  depth: string;
  
  isDefault: boolean;
  active: boolean;
  availableForOrder: boolean;
  coverImageUrl?: string; // Corretto da coverImage
  
  // L'array di attributi ora usa la nuova interfaccia corretta (VariantAttributeWithGroup)
  attributes: VariantAttributeWithGroup[]; 
  metadata?: string; // È una stringa JSON nel tuo payload
}

// NUOVA INTERFACCIA: Rappresenta come l'attributo è definito all'interno di 'variants'
export interface VariantAttributeWithGroup {
  id: number;
  attributeGroupId: number;
  code: string;
  colorHex?: string | null;
  colorPms?: string | null;
  imageUrl?: string | null;
  position: number;
  
  translations: VariantAttributeTranslation[];
  
  // Il Gruppo è ANNIDATO qui
  group: AttributeGroup; 
}

export interface VariantAttributeTranslation {
  locale: string;
  name: string;
}

// Rappresenta la struttura del gruppo di attributi
export interface AttributeGroup {  
  code: string;
  displayType: 'select' | 'radio' | 'color' | 'image';
  isPublic?: boolean; 
  name: string;
  // ATTENZIONE: Questo campo appare solo nell'array "attributeGroups" principale
  values?: AttributeValue[]; 
}

// Rappresenta i valori nell'array "attributeGroups" (in alto nel JSON)
export interface AttributeValue {
  code: string;
  name: string;
  colorHex?: string | null;
  colorPms?: string | null;
  imageUrl?: string | null;
}

export interface ProductTranslation {
  id: number;
  productId: number;
  locale: string;
  name: string;
  description: string;
  shortDescription: string;
  tags: string | null;
  metaTitle: string;
  metaDescription: string | null;
  metaKeywords: string;
  linkRewrite: string;
  availableNowLabel: string;
  availableLaterLabel: string;
  deliveryTimeInStockNote: string | null;
  deliveryTimeOutOfStockNote: string | null;
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  imageType: 'main' | 'extra' | string;
  position: number;
  isCover: boolean;
  altText: string | null;
}


export interface CreateProductData {
  name: string;
  sku: string;
  price: number;
  stock?: number;
  supplierId?: string;
  description?: string;
}

export interface UpdateProductData {
  name?: string;
  sku?: string;
  price?: number;
  stock?: number;
  supplierId?: string;
  description?: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt';
  order?: 'ASC' | 'DESC';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface ProductStats {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  inStock: number;
  avgPrice: string;
  totalInventoryValue: string;
}

// ============ Stock Update Types ============
export interface StockUpdate {
  stock: number;
  operation: 'set' | 'add' | 'subtract';
}

export interface ProductDetailResponse {
  status: 'success';
  data: {
    id: number;
    reference: string;
    type: string;
    name: string;
    description: string;
    shortDescription: string;
    price: number;
    priceRange?: { min: number; max: number };
    active: boolean;
    supplierId: string;
    images: ProductImage[];
    variants: ProductVariant[];
    attributeGroups: AttributeGroup[];
    translations?: ProductTranslation[];
  };
}