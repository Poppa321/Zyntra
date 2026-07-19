import { apiClient } from "@/api/client";
import type { BusinessProfileDto } from "@/api/types";

export function getProfile() {
  return apiClient.get<BusinessProfileDto>("/profile").then((res) => res.data);
}

export function updateProfile(payload: Partial<BusinessProfileDto>) {
  return apiClient.patch<BusinessProfileDto>("/profile", payload).then((res) => res.data);
}
