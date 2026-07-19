import { apiClient } from "@/api/client";
import type { CartDto } from "@/api/types";

export function getCart() {
  return apiClient.get<CartDto>("/cart").then((res) => res.data);
}

export function addCartItem(productId: string, quantity: number) {
  return apiClient
    .post<CartDto>("/cart/items", { productId, quantity })
    .then((res) => res.data);
}

export function updateCartItem(itemId: string, quantity: number) {
  return apiClient
    .patch<CartDto>(`/cart/items/${itemId}`, { quantity })
    .then((res) => res.data);
}

export function removeCartItem(itemId: string) {
  return apiClient.delete<CartDto>(`/cart/items/${itemId}`).then((res) => res.data);
}
