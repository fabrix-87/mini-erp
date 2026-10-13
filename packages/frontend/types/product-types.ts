import { ApiResponse, PaginatedResponse, Product } from "@mini-erp/shared";

// ============ Product Types ============
export interface ProductPreview {
  id: string;
  reference: string;
  name: string;
  price: number;
  quantity: number;
  active: boolean;
  supplierId: string;
  coverImage: string;
  shortDescription: string;
  description: string;
  variantCount: number;
}

export type ProductListApiResponse = PaginatedResponse<Product>;
export type ProductSingleApiResponse = ApiResponse<Product>;
//export type ProductStatsApiResponse = ApiResponse<ProductStats>;

export const PRODUCT_TAGS = {
  list: "products-list",
  detail: (id: string): string => `product-${id}`,
  stats: "products-stats",
} as const;
