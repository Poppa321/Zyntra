import axios, { AxiosError } from "axios";
import { Platform } from "react-native";

import type { ApiErrorBody } from "@/api/types";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export const WS_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const AUTH_TOKEN_KEY = "zyntra_auth_token";

const webTokenStore = new Map<string, string>();

// expo-secure-store has no web implementation and calls requireNativeModule()
// as soon as it's imported, so it must be lazy-required only on native platforms
// rather than imported at module scope.
function getSecureStore(): typeof import("expo-secure-store") {
  return require("expo-secure-store");
}

async function getStoredToken(key: string) {
  if (Platform.OS === "web") return webTokenStore.get(key) ?? null;
  return getSecureStore().getItemAsync(key);
}

async function writeStoredToken(key: string, value: string | null) {
  if (Platform.OS === "web") {
    if (value) webTokenStore.set(key, value);
    else webTokenStore.delete(key);
    return;
  }
  if (value) await getSecureStore().setItemAsync(key, value);
  else await getSecureStore().deleteItemAsync(key);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getStoredToken(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.set("Authorization", "Bearer " + token);
  }
  return config;
});

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const body = (error as AxiosError<ApiErrorBody>).response?.data;
    return body?.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export function getApiErrorCode(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    return (error as AxiosError<ApiErrorBody>).response?.data?.code;
  }
  return undefined;
}

export async function setAuthToken(token: string | null) {
  await writeStoredToken(AUTH_TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return getStoredToken(AUTH_TOKEN_KEY);
}
