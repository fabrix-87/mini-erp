import { Product, ProductImage, ProductPreview } from "@/types/product";
import api from "../api";
import { ApiResponse } from "@/types/api";

// ============ PRODUCTS ============
export const getProducts = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}): Promise<ApiResponse<ProductPreview[]>> => {
  const response = await api.get('/products', { params });
  return response.data; // { status, results, pagination, data }
};

/**
 * Get single product by ID
 * @returns {Product} Il prodotto pulito e tipizzato
 */
export const getProductById = async (
  id: string | number, 
  params?: { locale?: string }
): Promise<Product> => { // Tipizziamo la promessa come Product
  
  // 1. Chiamata API standard
  const response = await api.get(`/products/${id}`, { params });
  console.log('Raw product data:', response.data);
  // Tipizziamo immediatamente i dati grezzi ricevuti
  let productData: Product = response.data.data; 

  // 2. Logica di Pulizia delle Immagini Duplicate
  if (productData.images && productData.images.length > 0) {
      const uniqueImagesMap = new Map<string, ProductImage>();
      
      productData.images.forEach(img => {
          // Utilizziamo l'URL come chiave per identificare i duplicati
          // Manteniamo solo la prima occorrenza
          if (!uniqueImagesMap.has(img.imageUrl)) {
              uniqueImagesMap.set(img.imageUrl, img);
          }
      });
      
      // Sostituiamo l'array originale con l'array filtrato
      productData.images = Array.from(uniqueImagesMap.values());
  }
  
  // 3. Ritorna i dati puliti
  return productData;
};

/**
 * Get variant by attributes combination
 */
export const getVariantByAttributes = async (
  productId: string | number,
  attributes: string // format: "color:red,size:xl"
) => {
  const response = await api.get(`/products/${productId}/variant`, {
    params: { attributes }
  });
  return response.data;
};

/**
 * Update variant stock
 */
export const updateVariantStock = async (
  variantId: number,
  data: {
    quantity: number;
    operation?: 'set' | 'add' | 'subtract';
  }
) => {
  const response = await api.patch(`/products/variants/${variantId}/stock`, data);
  return response.data;
};

export const getProductStats = async () => {
  const response = await api.get('/products/stats');
  return response.data.data;
};

export const createProduct = async (product: {
  name: string;
  sku: string;
  price: number;
  stock?: number;
  supplierId?: string;
  description?: string;
}) => {
  const response = await api.post('/products', product);
  return response.data;
};

export const updateProduct = async (id: number, product: {
  name?: string;
  sku?: string;
  price?: number;
  stock?: number;
  supplierId?: string;
  description?: string;
}) => {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
};

export const updateProductStock = async (
  id: number,
  stock: number,
  operation: 'set' | 'add' | 'subtract' = 'set'
) => {
  const response = await api.patch(`/products/${id}/stock`, { stock, operation });
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const deleteProductsBatch = async (ids: number[]) => {
  const response = await api.delete('/products', { data: { ids } });
  return response.data;
};