import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Star } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { formatRelativeTime } from "@/lib/format";
import { useCreateReviewMutation, useReviewsQuery } from "@/hooks/useReviews";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";

type ProductReviewsProps = {
  productId: string;
  averageRating: number;
  reviewCount: number;
  canReview: boolean;
};

export function ProductReviews({ productId, averageRating, reviewCount, canReview }: ProductReviewsProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: reviews, isLoading } = useReviewsQuery(productId);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text weight="extraBold" style={styles.sectionLabel}>
          REVIEWS
        </Text>
        <View style={styles.summaryRow}>
          <StarRow rating={averageRating} size={13} color={colors.gold} />
          <Text weight="semiBold" style={styles.summaryText}>
            {reviewCount > 0 ? `${averageRating.toFixed(1)} · ${reviewCount} review${reviewCount === 1 ? "" : "s"}` : "No reviews yet"}
          </Text>
        </View>
      </View>

      {canReview && (
        <Pressable onPress={() => setFormOpen((open) => !open)} style={styles.toggleButton}>
          <Text weight="semiBold" color={colors.navy} style={styles.toggleLabel}>
            {formOpen ? "Cancel" : "Write a review"}
          </Text>
        </Pressable>
      )}

      {formOpen && <ReviewForm productId={productId} onDone={() => setFormOpen(false)} />}

      {isLoading && (
        <Text weight="regular" color={colors.textMuted} style={styles.emptyText}>
          Loading reviews…
        </Text>
      )}

      {!isLoading && reviews.length === 0 && (
        <Text weight="regular" color={colors.textMuted} style={styles.emptyText}>
          Be the first to review this product.
        </Text>
      )}

      <View style={styles.list}>
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text weight="semiBold" style={styles.reviewerName}>
                {review.distributorName}
              </Text>
              <Text weight="regular" color={colors.textMuted} style={styles.reviewDate}>
                {formatRelativeTime(review.createdAt)}
              </Text>
            </View>
            <StarRow rating={review.rating} size={12} color={colors.gold} />
            {!!review.comment && (
              <Text weight="regular" style={styles.reviewComment}>
                {review.comment}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const createReview = useCreateReviewMutation(productId);

  function handleSubmit() {
    createReview.mutate(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          setComment("");
          setRating(5);
          onDone();
        },
        onError: (error) => showAlert("Couldn't submit review", getApiErrorMessage(error)),
      },
    );
  }

  return (
    <View style={styles.form}>
      <StarPicker value={rating} onChange={setRating} color={colors.gold} />
      <TextField
        placeholder="Share how this product worked out for you (optional)"
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <Button
        label={createReview.isPending ? "Submitting…" : "Submit review"}
        onPress={handleSubmit}
        disabled={createReview.isPending}
        loading={createReview.isPending}
      />
    </View>
  );
}

function StarRow({ rating, size, color }: { rating: number; size: number; color: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={size} color={color} weight={star <= Math.round(rating) ? "fill" : "regular"} />
      ))}
    </View>
  );
}

function StarPicker({ value, onChange, color }: { value: number; onChange: (rating: number) => void; color: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star)} hitSlop={10}>
          <Star size={26} color={color} weight={star <= value ? "fill" : "regular"} />
        </Pressable>
      ))}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      marginTop: 16,
      gap: 12,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionLabel: {
      fontSize: 12,
      color: colors.textPrimary,
    },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    summaryText: {
      fontSize: 11,
      color: colors.textPrimary,
    },
    toggleButton: {
      alignSelf: "flex-start",
      height: 34,
      paddingHorizontal: 12,
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: colors.navy,
      borderRadius: radius.sm,
    },
    toggleLabel: {
      fontSize: 11,
    },
    form: {
      gap: 12,
      padding: 14,
      backgroundColor: colors.offWhite,
      borderRadius: radius.sm,
    },
    emptyText: {
      fontSize: 12,
    },
    list: {
      gap: 10,
    },
    reviewCard: {
      gap: 6,
      padding: 12,
      backgroundColor: colors.offWhite,
      borderRadius: radius.sm,
    },
    reviewHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    reviewerName: {
      fontSize: 12,
      color: colors.textPrimary,
    },
    reviewDate: {
      fontSize: 10,
    },
    reviewComment: {
      fontSize: 13,
      color: colors.textPrimary,
      lineHeight: 19,
    },
  });
}
