import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  useFonts,
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_600SemiBold,
  NotoSans_700Bold,
} from "@expo-google-fonts/noto-sans";

import { queryClient } from "@/lib/queryClient";
import { GoogleAuthProvider } from "@/lib/googleAuth";
import { ThemeProvider, useTheme } from "@/theme/ThemeContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_600SemiBold,
    NotoSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GoogleAuthProvider>
          <RootLayoutNav />
        </GoogleAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Default status bar contrast follows the active theme — most screens are
// light-background even in "dark mode" toggles for content, so this is the
// sensible fallback; screens with their own dark hero/header still render
// their own <StatusBar> to override it.
function RootLayoutNav() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="list-product" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
