import { useQuery } from "@tanstack/react-query";

import { getTrustScore } from "@/api/endpoints/manufacturers";

export function useTrustScoreQuery(manufacturerId: string | undefined) {
  return useQuery({
    queryKey: ["manufacturer", manufacturerId, "trust-score"],
    queryFn: () => getTrustScore(manufacturerId as string),
    enabled: !!manufacturerId,
  });
}
