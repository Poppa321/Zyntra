import { apiClient } from "@/api/client";
import type { CreateProductPayload, DashboardStatsDto, InventoryItemDto } from "@/api/types";

export function listInventory() {
  return apiClient.get<InventoryItemDto[]>("/manufacturer/inventory").then((res) => res.data);
}

export function createProduct(payload: CreateProductPayload) {
  return apiClient
    .post<InventoryItemDto>("/manufacturer/inventory", payload)
    .then((res) => res.data);
}

export function updateProduct(id: string, payload: Partial<CreateProductPayload>) {
  return apiClient
    .patch<InventoryItemDto>(`/manufacturer/inventory/${id}`, payload)
    .then((res) => res.data);
}

export function getDashboardStats() {
  return apiClient.get<DashboardStatsDto>("/manufacturer/dashboard").then((res) => res.data);
}
