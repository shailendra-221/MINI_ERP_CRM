import { api } from "./client";
import { Product, Paginated, StockMovement } from "./types";

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
}

export async function fetchProducts(params: ProductListParams) {
  const res = await api.get<Paginated<Product>>("/products", { params });
  return res.data;
}

export async function fetchProduct(id: string) {
  const res = await api.get<{ success: boolean; data: Product }>(`/products/${id}`);
  return res.data.data;
}

export type ProductFormValues = {
  name: string;
  sku: string;
  category?: string;
  unitPrice: number;
  currentStock?: number;
  minStockAlertQty?: number;
  location?: string;
};

export async function createProduct(payload: ProductFormValues) {
  const res = await api.post<{ success: boolean; data: Product }>("/products", payload);
  return res.data.data;
}

export async function updateProduct(id: string, payload: Partial<ProductFormValues>) {
  const res = await api.put<{ success: boolean; data: Product }>(`/products/${id}`, payload);
  return res.data.data;
}

export async function addStockMovement(
  id: string,
  payload: { quantity: number; movementType: "IN" | "OUT"; reason: string }
) {
  const res = await api.post<{ success: boolean; data: StockMovement; currentStock: number }>(
    `/products/${id}/stock-movements`,
    payload
  );
  return res.data;
}
