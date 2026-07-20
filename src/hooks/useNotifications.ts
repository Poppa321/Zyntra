import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as notificationsApi from "@/api/endpoints/notifications";
import { mapNotification } from "@/api/mappers";
import type { Notification } from "@/types/domain";

const NOTIFICATIONS_KEY = ["notifications"];

export function useNotificationsQuery() {
  const query = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => notificationsApi.listNotifications().then((list) => list.map(mapNotification)),
    refetchInterval: 60_000,
  });

  return { ...query, data: query.data ?? [] };
}

function markReadInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  predicate: (notification: Notification) => boolean,
) {
  queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (current) =>
    current?.map((item) => (predicate(item) ? { ...item, read: true } : item)),
  );
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markNotificationRead(id),
    onMutate: async (id) => markReadInCache(queryClient, (n) => n.id === id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllNotificationsRead(),
    onMutate: async () => markReadInCache(queryClient, () => true),
    onSettled: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });
}
