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

export type {
  Product
} from '@mini-erp/shared/types'

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