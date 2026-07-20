import { apiClient } from "@/api/client";
import type { ManufacturerDashboardDto } from "@/api/types";

export function getManufacturerDashboard() {
  return apiClient.get<ManufacturerDashboardDto>("/dashboard/manufacturer").then((res) => res.data);
}
