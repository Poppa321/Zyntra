import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

/** Shared connectivity flag — avoids every screen wiring its own NetInfo listener. */
export function useIsOffline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  return isOffline;
}
