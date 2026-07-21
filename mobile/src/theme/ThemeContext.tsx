import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: user } = useSessionQuery();
  const [isDark, setIsDark] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  // Adopt the signed-in user's saved preference once, on session load —
  // after that, local toggles (persisted separately) own the value so the
  // switch doesn't snap back while a save is in flight.
  useEffect(() => {
    if (user && !hasSynced) {
      setIsDark(user.darkMode);
      setHasSynced(true);
    }
  }, [user, hasSynced]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      isDark,
      colors: isDark ? darkColors : lightColors,
      setIsDark,
    }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeColors() {
  return useContext(ThemeContext).colors;
}
