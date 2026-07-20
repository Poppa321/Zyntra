import { apiClient } from "@/api/client";
import type { InitializePaymentResponse, PaymentDto } from "@/api/types";

export function initializePayment(orderId: string) {
  return apiClient
    .post<InitializePaymentResponse>("/payments/initialize", { orderId })
    .then((res) => res.data);
}

export function verifyPayment(reference: string) {
  return apiClient.get<PaymentDto>(`/payments/verify/${reference}`).then((res) => res.data);
}
