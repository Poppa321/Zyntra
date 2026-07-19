import { apiClient } from "@/api/client";
import type { ManufacturerDto, ProductDto } from "@/api/types";

export type ListProductsParams = {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export function listProducts(params: ListProductsParams = {}) {
  return apiClient.get<ProductDto[]>("/products", { params }).then((res) => res.data);
}

export function getProduct(id: string) {
  return apiClient.get<ProductDto>(`/products/${id}`).then((res) => res.data);
}

export function listTopManufacturers() {
  return apiClient.get<ManufacturerDto[]>("/manufacturers/top").then((res) => res.data);
}
