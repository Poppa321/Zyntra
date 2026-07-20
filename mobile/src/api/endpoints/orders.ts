import { apiClient } from "@/api/client";
import type { CreateOrderRequest, OrderDetailDto, OrderGroup, PageResponse, OrderDto } from "@/api/types";

export function createOrder(payload: CreateOrderRequest) {
  return apiClient.post<OrderDetailDto>("/orders", payload).then((res) => res.data);
}

export function listOrders(group: OrderGroup, page = 0, size = 20) {
  return apiClient
    .get<PageResponse<OrderDto>>("/orders", { params: { group, page, size } })
    .then((res) => res.data);
}

export function getOrder(id: string) {
  return apiClient.get<OrderDetailDto>(`/orders/${id}`).then((res) => res.data);
}

export function acceptOrder(id: string) {
  return apiClient.post<OrderDetailDto>(`/orders/${id}/accept`).then((res) => res.data);
}

export function declineOrder(id: string, reason: string) {
  return apiClient.post<OrderDetailDto>(`/orders/${id}/decline`, { reason }).then((res) => res.data);
}

export function shipOrder(id: string) {
  return apiClient.post<OrderDetailDto>(`/orders/${id}/ship`).then((res) => res.data);
}

export function outForDeliveryOrder(id: string) {
  return apiClient.post<OrderDetailDto>(`/orders/${id}/out-for-delivery`).then((res) => res.data);
}

export function deliverOrder(id: string) {
  return apiClient.post<OrderDetailDto>(`/orders/${id}/deliver`).then((res) => res.data);
}

export function cancelOrder(id: string) {
  return apiClient.post<OrderDetailDto>(`/orders/${id}/cancel`).then((res) => res.data);
}
