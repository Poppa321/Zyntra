import { apiClient } from "@/api/client";
import type { AddressDto, CreateAddressPayload } from "@/api/types";

export function listAddresses() {
  return apiClient.get<AddressDto[]>("/addresses").then((res) => res.data);
}

export function createAddress(payload: CreateAddressPayload) {
  return apiClient.post<AddressDto>("/addresses", payload).then((res) => res.data);
}

export function setDefaultAddress(id: string) {
  return apiClient.patch<AddressDto>(`/addresses/${id}/default`).then((res) => res.data);
}

export function deleteAddress(id: string) {
  return apiClient.delete<void>(`/addresses/${id}`).then((res) => res.data);
}
