import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import { WifiSlash } from "phosphor-react-native";
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
import { Text } from "@/components/Text";

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
  const { isDark, colors } = useTheme();
  const [isOffline, setIsOffline] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="list-product" options={{ presentation: "modal" }} />
        </Stack>

        {isOffline && (
          <View style={[styles.offlineBanner, { bottom: insets.bottom + 16 }]}>
            <View style={styles.offlineRow}>
              <View style={styles.offlineBadge}>
                <WifiSlash size={16} color="#d64545" weight="bold" />
              </View>
              <View style={styles.offlineTextContainer}>
                <Text weight="bold" style={styles.offlineTitle}>
                  No Connection
                </Text>
                <Text weight="medium" style={styles.offlineSubtitle}>
                  Viewing cached data offline
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offlineBanner: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: "rgba(15, 39, 67, 0.95)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(234, 170, 52, 0.3)",
  },
  offlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  offlineBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(214, 69, 69, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  offlineTextContainer: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 14,
    color: "#ffffff",
  },
  offlineSubtitle: {
    fontSize: 12,
    color: "#b2b8bd",
  },
});

