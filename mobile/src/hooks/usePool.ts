import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProductPool, joinProductPool } from "@/api/endpoints/products";
import { useSessionQuery } from "@/hooks/useAuth";

export function useProductPoolQuery(productId: string | undefined) {
  const { data: session } = useSessionQuery();
  return useQuery({
    queryKey: ["product-pool", productId],
    queryFn: () => getProductPool(productId as string),
    enabled: !!productId && session?.role === "DISTRIBUTOR",
  });
}

export function useJoinPoolMutation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quantity: number) => joinProductPool(productId, { quantity }),
    onSuccess: (pool) => {
      queryClient.setQueryData(["product-pool", productId], pool);
    },
  });
}
