import { apiClient } from "@/api/client";
import type { TrustScoreDto } from "@/api/types";

export function getTrustScore(manufacturerId: string) {
  return apiClient.get<TrustScoreDto>(`/manufacturers/${manufacturerId}/trust-score`).then((res) => res.data);
}
