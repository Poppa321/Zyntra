import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createReview, listReviews } from "@/api/endpoints/reviews";
import type { CreateReviewPayload } from "@/api/types";

export function useReviewsQuery(productId: string | undefined) {
  const query = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => listReviews(productId as string).then((page) => page.content),
    enabled: !!productId,
  });

  return { ...query, data: query.data ?? [] };
}

export function useCreateReviewMutation(productId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReview(productId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
}
