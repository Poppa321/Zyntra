import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/api/endpoints/notifications";
import { mapNotification } from "@/api/mappers";
import { notifications as sampleNotifications, type Notification } from "@/data/sampleData";

const NOTIFICATIONS_KEY = ["notifications"];

export function useNotificationsQuery() {
  const query = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => listNotifications().then((list) => list.map(mapNotification)),
    initialData: sampleNotifications,
    staleTime: Infinity,
  });

  return { ...query, data: query.data ?? [] };
}

function updateNotifications(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (notifications: Notification[]) => Notification[],
) {
  queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (current) => updater(current ?? []));
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      updateNotifications(queryClient, (list) =>
        list.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
      return markNotificationRead(id).catch(() => null);
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      updateNotifications(queryClient, (list) => list.map((item) => ({ ...item, read: true })));
      return markAllNotificationsRead().catch(() => null);
    },
  });
}
