import { useEffect, useRef } from "react";

import { registerPushToken } from "@/api/endpoints/auth";
import { registerForPushNotificationsAsync } from "@/lib/pushNotifications";
import { useSessionQuery } from "@/hooks/useAuth";

/** Registers this device's Expo push token against the signed-in user, once per session. */
export function usePushRegistration() {
  const { data: user } = useSessionQuery();
  const registeredFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user || registeredFor.current === user.id) return;
    registeredFor.current = user.id;

    registerForPushNotificationsAsync()
      .then((token) => (token ? registerPushToken(token) : undefined))
      .catch(() => {
        // Best-effort — push is a fallback channel, never block the app on it.
      });
  }, [user]);
}
