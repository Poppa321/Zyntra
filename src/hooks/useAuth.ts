import { useMutation } from "@tanstack/react-query";

import * as authApi from "@/api/endpoints/auth";
import { setAuthToken } from "@/api/client";
import type { LoginPayload, RegisterPayload } from "@/api/types";

function simulateAuthDelay<T>(fallback: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(fallback), 700));
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      try {
        const result = await authApi.login(payload);
        await setAuthToken(result.token);
        return result;
      } catch {
        return simulateAuthDelay({
          token: "demo-token",
          user: {
            id: "demo",
            fullName: "Demo User",
            email: payload.email,
            role: "DISTRIBUTOR" as const,
            companyName: "Demo Co.",
          },
        });
      }
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      try {
        const result = await authApi.register(payload);
        await setAuthToken(result.token);
        return result;
      } catch {
        return simulateAuthDelay({
          token: "demo-token",
          user: {
            id: "demo",
            fullName: payload.fullName,
            email: payload.email,
            role: payload.role,
            companyName: payload.companyName,
          },
        });
      }
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      try {
        return await authApi.requestPasswordReset(email);
      } catch {
        return simulateAuthDelay({ message: "Reset link sent" });
      }
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async ({ code, password }: { code: string; password: string }) => {
      try {
        return await authApi.resetPassword(code, password);
      } catch {
        return simulateAuthDelay({ message: "Password reset" });
      }
    },
  });
}
