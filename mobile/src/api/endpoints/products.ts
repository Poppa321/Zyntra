import { apiClient } from "@/api/client";
import type { BoostProductResponse, BoostStatusDto, LowStockProductDto, PageResponse, ProductCardDto, ProductCreateRequest, ProductDetailDto, StockUpdateRequest } from "@/api/types";

export type ListProductsParams = {
  category?: string;
  search?: string;
  manufacturerId?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export function listProducts(params: ListProductsParams = {}) {
  return apiClient
    .get<PageResponse<ProductCardDto>>("/products", { params })
    .then((res) => res.data);
}

export function getProduct(id: string) {
  return apiClient.get<ProductDetailDto>(`/products/${id}`).then((res) => res.data);
}

export function createProduct(payload: ProductCreateRequest) {
  return apiClient.post<ProductDetailDto>("/products", payload).then((res) => res.data);
}

export function updateProduct(id: string, payload: ProductCreateRequest) {
  return apiClient.put<ProductDetailDto>(`/products/${id}`, payload).then((res) => res.data);
}

export function updateStock(id: string, payload: StockUpdateRequest) {
  return apiClient.patch<ProductDetailDto>(`/products/${id}/stock`, payload).then((res) => res.data);
}

export function deleteProduct(id: string) {
  return apiClient.delete<void>(`/products/${id}`).then((res) => res.data);
}

export function uploadProductPhoto(id: string, photo: { uri: string; name: string; type: string }) {
  const formData = new FormData();
  // React Native's FormData accepts this {uri, name, type} shape for file
  // parts; it isn't a real Blob/File, hence the cast.
  formData.append("file", photo as unknown as Blob);
  return apiClient
    .post<ProductDetailDto>(`/products/${id}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
}

export function listLowStock() {
  return apiClient.get<LowStockProductDto[]>("/products/low-stock").then((res) => res.data);
}

export function initializeBoost(productId: string) {
  return apiClient.post<BoostProductResponse>(`/products/${productId}/feature/initialize`).then((res) => res.data);
}

export function verifyBoost(reference: string) {
  return apiClient.get<BoostStatusDto>(`/products/feature/verify/${reference}`).then((res) => res.data);
}
