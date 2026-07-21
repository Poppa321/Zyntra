import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

import type { Role } from "@/api/types";
import { useGoogleAuthMutation } from "@/hooks/useAuth";

WebBrowser.maybeCompleteAuthSession();

// Google requires per-platform OAuth client IDs from Google Cloud Console
// (console.cloud.google.com → APIs & Services → Credentials): a Web client
// for the browser, and native iOS/Android clients so the redirect can use a
// custom URI scheme — Google rejects custom-scheme redirects on Web clients
// outright ("invalid_request"), which is why this can't just reuse the web id.
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";

export type GoogleSignInResult = { role: Role | null };

type PendingRequest = {
  role?: Role;
  onSuccess: (result: GoogleSignInResult) => void;
  onError: (message: string) => void;
};

type GoogleSignInContextValue = {
  isConfigured: boolean;
  isPending: boolean;
  requestReady: boolean;
  promptGoogleSignIn: (request: PendingRequest) => void;
};

const GoogleSignInContext = createContext<GoogleSignInContextValue | null>(null);

// On native, `useIdTokenAuthRequest`'s `promptAsync()` only resolves with the
// raw authorization-code exchange step — the actual id_token only shows up
// later, via a separate internal effect inside expo-auth-session that swaps
// the code for tokens and updates `response`. That effect is tied to this
// hook's component staying mounted long enough to finish. But the OAuth
// redirect deep link (zyntra://oauthredirect) makes expo-router reset the
// whole nav stack, unmounting whatever screen (Login/Register) held the
// button — cutting the exchange short before it can complete. Hoisting the
// hook up to the root layout, which nothing ever unmounts, lets that
// exchange run to completion regardless of what screen the redirect landed
// on; the pending role/callbacks are stashed in a ref (not per-screen state)
// so they survive the screen that requested them being torn down.
export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const googleAuth = useGoogleAuthMutation();
  const pendingRef = useRef<PendingRequest | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });

  const isConfigured = Boolean(
    Platform.select({
      ios: Boolean(IOS_CLIENT_ID),
      android: Boolean(ANDROID_CLIENT_ID),
      default: Boolean(WEB_CLIENT_ID),
    }),
  );

  useEffect(() => {
    const pending = pendingRef.current;
    if (!response || !pending) return;

    if (response.type !== "success") {
      pendingRef.current = null;
      if (response.type === "error") {
        pending.onError(response.error?.message ?? "Google sign-in failed");
      }
      return;
    }

    const idToken = response.params.id_token;
    pendingRef.current = null;
    if (!idToken) {
      pending.onError("Google didn't return an identity token");
      return;
    }
    googleAuth.mutate(
      { idToken, role: pending.role },
      {
        onSuccess: (result) => pending.onSuccess({ role: result.user.role }),
        onError: () => pending.onError("Couldn't sign in with Google"),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  function promptGoogleSignIn(pending: PendingRequest) {
    pendingRef.current = pending;
    promptAsync();
  }

  return (
    <GoogleSignInContext.Provider
      value={{
        isConfigured,
        isPending: googleAuth.isPending,
        requestReady: Boolean(request),
        promptGoogleSignIn,
      }}
    >
      {children}
    </GoogleSignInContext.Provider>
  );
}

export function useGoogleSignIn() {
  const ctx = useContext(GoogleSignInContext);
  if (!ctx) throw new Error("useGoogleSignIn must be used within GoogleAuthProvider");
  return ctx;
}
