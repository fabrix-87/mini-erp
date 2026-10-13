"use server";

import { serverApi } from "@/lib/server/api";
import { DeleteApiResponse } from "@/types/api";
import {
  PRODUCT_TAGS,
  ProductListApiResponse,
  ProductSingleApiResponse,
} from "@/types/product-types";
import {
  CreateProductFormValues,
  Product,
  ProductQueryInput,
  UpdateProductFormValues,
} from "@mini-erp/shared";

/**
 * Fetch paginated products list.
 * @param params - Query filters and pagination
 * @param revalidate - Cache TTL in seconds (false = no cache)
 */
export async function getAllProducts(
  params: ProductQueryInput,
  revalidate?: number | false,
): Promise<ProductListApiResponse> {
  return serverApi.get<ProductListApiResponse>("/products", {
    params,
    revalidate: revalidate ?? false,
    tags: [PRODUCT_TAGS.list],
    unwrapData: false,
  });
}

/**
 * Fetch single product by ID.
 * @param id - Product ID
 */
export async function getProductById(id: string, revalidate?: number | false): Promise<Product> {
  return serverApi.get<Product>(`/products/${id}`, {
    revalidate: revalidate ?? false,
    tags: [PRODUCT_TAGS.detail(id)],
  });
}

/**
 * Create a new product.
 */
export async function createProduct(
  data: CreateProductFormValues,
): Promise<ProductSingleApiResponse> {
  return serverApi.post<ProductSingleApiResponse>("/products", data, {
    tags: [PRODUCT_TAGS.list],
    unwrapData: false,
  });
}

/**
 * Update an existing product.
 */
export async function updateProduct(
  id: string,
  data: UpdateProductFormValues,
): Promise<ProductSingleApiResponse> {
  return serverApi.put<ProductSingleApiResponse>(`/products/${id}`, data, {
    tags: [PRODUCT_TAGS.detail(id)],
    unwrapData: false,
  });
}

/**
 * Delete a product.
 */
export async function deleteProduct(id: string): Promise<DeleteApiResponse> {
  return serverApi.delete(`/products/${id}`);
}
