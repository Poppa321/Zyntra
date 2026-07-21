import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";

import * as authApi from "@/api/endpoints/auth";
import { getAuthToken, setAuthToken } from "@/api/client";
import type { AuthResponseDto, GoogleAuthPayload, LoginPayload, RegisterPayload } from "@/api/types";

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (payload: LoginPayload): Promise<AuthResponseDto> => {
      const result = await authApi.login(payload);
      await setAuthToken(result.token);
      return result;
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload): Promise<AuthResponseDto> => {
      // /auth/register accepts the role directly, so the returned token
      // already carries the role claim needed by role-gated endpoints.
      const result = await authApi.register(payload);
      await setAuthToken(result.token);
      return result;
    },
  });
}

export function useGoogleAuthMutation() {
  return useMutation({
    mutationFn: async (payload: GoogleAuthPayload): Promise<AuthResponseDto> => {
      const result = await authApi.googleAuth(payload);
      await setAuthToken(result.token);
      return result;
    },
  });
}

export function useSetRoleMutation() {
  return useMutation({
    mutationFn: authApi.setRole,
  });
}

/** Reads the persisted token (if any) and verifies it against the backend. */
export function useSessionQuery() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const token = await getAuthToken();
      if (!token) return null;
      try {
        return await authApi.me();
      } catch (error) {
        // Only a definitive "this token is invalid" response should log the
        // user out. Anything else (network drop, timeout, backend 5xx) must
        // leave the stored token alone — otherwise a transient blip on cold
        // start signs the user out for good, which is exactly the bug this
        // used to cause: forced re-login on every app open.
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status === 401 || status === 403) {
          await setAuthToken(null);
          return null;
        }
        throw error;
      }
    },
    staleTime: 0,
    retry: 2,
  });
}

export async function logout() {
  await setAuthToken(null);
}

// The backend has no password-reset flow (out of scope per its spec); these
// simulate success locally so the existing UI screens still work end to end.
function simulateDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 700));
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (_email: string) => simulateDelay({ message: "Reset link sent" }),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (_input: { code: string; password: string }) =>
      simulateDelay({ message: "Password reset" }),
  });
}
