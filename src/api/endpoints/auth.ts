import { apiClient } from "@/api/client";
import type { AuthResponseDto, LoginPayload, RegisterPayload } from "@/api/types";

export function login(payload: LoginPayload) {
  return apiClient.post<AuthResponseDto>("/auth/login", payload).then((res) => res.data);
}

export function register(payload: RegisterPayload) {
  return apiClient.post<AuthResponseDto>("/auth/register", payload).then((res) => res.data);
}

export function requestPasswordReset(email: string) {
  return apiClient
    .post<{ message: string }>("/auth/forgot-password", { email })
    .then((res) => res.data);
}

export function resetPassword(code: string, password: string) {
  return apiClient
    .post<{ message: string }>("/auth/reset-password", { code, password })
    .then((res) => res.data);
}
