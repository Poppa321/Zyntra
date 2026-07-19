import { apiClient } from "@/api/client";
import type { NotificationDto } from "@/api/types";

export function listNotifications() {
  return apiClient.get<NotificationDto[]>("/notifications").then((res) => res.data);
}

export function markNotificationRead(id: string) {
  return apiClient.patch<NotificationDto>(`/notifications/${id}/read`).then((res) => res.data);
}

export function markAllNotificationsRead() {
  return apiClient.post<void>("/notifications/read-all").then((res) => res.data);
}
