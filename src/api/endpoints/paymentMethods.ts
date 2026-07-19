import { apiClient } from "@/api/client";
import type { CreatePaymentMethodPayload, PaymentMethodDto } from "@/api/types";

export function listPaymentMethods() {
  return apiClient.get<PaymentMethodDto[]>("/payment-methods").then((res) => res.data);
}

export function createPaymentMethod(payload: CreatePaymentMethodPayload) {
  return apiClient.post<PaymentMethodDto>("/payment-methods", payload).then((res) => res.data);
}

export function deletePaymentMethod(id: string) {
  return apiClient.delete<void>(`/payment-methods/${id}`).then((res) => res.data);
}

export function setDefaultPaymentMethod(id: string) {
  return apiClient.post<PaymentMethodDto>(`/payment-methods/${id}/default`).then((res) => res.data);
}
