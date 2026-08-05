import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getStoredToken, writeStoredToken } from "@/api/client";
import { colors as lightColors } from "@/theme/colors";
import { darkColors } from "@/theme/darkColors";
import { useSessionQuery } from "@/hooks/useAuth";

export type ThemeColors = Record<keyof typeof lightColors, string>;

type ThemeContextValue = {
  isDark: boolean;
  colors: ThemeColors;
  setIsDark: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  colors: lightColors,
  setIsDark: () => {},
});

const DARK_MODE_KEY = "zyntra_dark_mode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: user } = useSessionQuery();
  const [isDark, setIsDarkState] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  // The session query is a network round-trip, so waiting on `user.darkMode`
  // before applying the theme means every cold start briefly flashes light
  // mode before flipping — read here as "dark mode is slow to respond". A
  // locally cached preference resolves near-instantly and closes that gap;
  // the session value (once it arrives) remains the source of truth below.
  useEffect(() => {
    let cancelled = false;
    getStoredToken(DARK_MODE_KEY).then((stored) => {
      if (cancelled || stored === null) return;
      setIsDarkState(stored === "true");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Adopt the signed-in user's saved preference once, on session load —
  // after that, local toggles (persisted separately) own the value so the
  // switch doesn't snap back while a save is in flight.
  useEffect(() => {
    if (!user || hasSynced) return;

    const nextMode = user.darkMode;
    Promise.resolve().then(() => {
      setIsDarkState(nextMode);
      setHasSynced(true);
    });
  }, [user, hasSynced]);

  function setIsDark(value: boolean) {
    setIsDarkState(value);
    writeStoredToken(DARK_MODE_KEY, value ? "true" : "false").catch(() => {});
  }

  const value = useMemo<ThemeContextValue>(
    () => ({
      isDark,
      colors: isDark ? darkColors : lightColors,
      setIsDark,
    }),
    [isDark],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeColors() {
  return useContext(ThemeContext).colors;
}
