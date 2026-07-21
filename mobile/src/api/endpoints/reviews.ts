import { apiClient } from "@/api/client";
import type { CreateReviewPayload, PageResponse, ReviewDto } from "@/api/types";

export function listReviews(productId: string, page = 0, size = 20) {
  return apiClient
    .get<PageResponse<ReviewDto>>(`/products/${productId}/reviews`, { params: { page, size } })
    .then((res) => res.data);
}

export function createReview(productId: string, payload: CreateReviewPayload) {
  return apiClient.post<ReviewDto>(`/products/${productId}/reviews`, payload).then((res) => res.data);
}
