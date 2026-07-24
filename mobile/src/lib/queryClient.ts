import { QueryClient, onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// Setup onlineManager listener for React Query using NetInfo
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes cache is fresh
      gcTime: 24 * 60 * 60 * 1000, // 24 hours garbage collection/cache time
      retry: 1,
    },
  },
});

