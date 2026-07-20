import { apiClient } from "@/api/client";
import type { AuthResponseDto, LoginPayload, RegisterPayload, UpdateProfilePayload, UserDto } from "@/api/types";

export function login(payload: LoginPayload) {
  return apiClient.post<AuthResponseDto>("/auth/login", payload).then((res) => res.data);
}

export function register(payload: RegisterPayload) {
  return apiClient.post<AuthResponseDto>("/auth/register", payload).then((res) => res.data);
}

export function me() {
  return apiClient.get<UserDto>("/auth/me").then((res) => res.data);
}

export function updateMe(payload: UpdateProfilePayload) {
  return apiClient.put<UserDto>("/auth/me", payload).then((res) => res.data);
}
