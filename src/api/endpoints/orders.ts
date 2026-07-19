import { apiClient } from "@/api/client";
import type { OrderDto, OrderTrackingDto } from "@/api/types";

export type OrderTab = "active" | "completed" | "cancelled";

export function listDistributorOrders(tab: OrderTab) {
  return apiClient
    .get<OrderDto[]>("/orders", { params: { tab } })
    .then((res) => res.data);
}

export function listIncomingOrders() {
  return apiClient.get<OrderDto[]>("/manufacturer/orders/incoming").then((res) => res.data);
}

export function getOrderTracking(orderId: string) {
  return apiClient
    .get<OrderTrackingDto>(`/orders/${orderId}/tracking`)
    .then((res) => res.data);
}

export function acceptOrder(orderId: string) {
  return apiClient.post<OrderDto>(`/manufacturer/orders/${orderId}/accept`).then((res) => res.data);
}

export function declineOrder(orderId: string) {
  return apiClient.post<OrderDto>(`/manufacturer/orders/${orderId}/decline`).then((res) => res.data);
}

export function markOrderShipped(orderId: string) {
  return apiClient
    .post<OrderDto>(`/manufacturer/orders/${orderId}/ship`)
    .then((res) => res.data);
}

export function placeOrder(cartId: string) {
  return apiClient.post<OrderDto>("/orders", { cartId }).then((res) => res.data);
}
