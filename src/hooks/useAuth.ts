import { useMutation, useQuery } from "@tanstack/react-query";

import * as authApi from "@/api/endpoints/auth";
import { getAuthToken, setAuthToken } from "@/api/client";
import type { AuthResponseDto, LoginPayload, RegisterPayload } from "@/api/types";

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

/** Reads the persisted token (if any) and verifies it against the backend. */
export function useSessionQuery() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const token = await getAuthToken();
      if (!token) return null;
      try {
        return await authApi.me();
      } catch {
        await setAuthToken(null);
        return null;
      }
    },
    staleTime: 0,
    retry: false,
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
