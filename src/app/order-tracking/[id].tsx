import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft, Check, Phone, User } from "phosphor-react-native";

import { IconButton } from "@/components/IconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { TrackingMap } from "@/components/TrackingMap";
import { useOrderTrackingQuery } from "@/hooks/useOrders";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";

const FALLBACK_STEPS = [
  { key: "packed", label: "Packed", status: "done" as const },
  { key: "shipped", label: "Shipped", status: "done" as const },
  { key: "transit", label: "In Transit", status: "current" as const },
  { key: "delivered", label: "Delivered", status: "pending" as const },
];

export default function OrderTracking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useOrderTrackingQuery(id);

  const steps = data?.steps ?? FALLBACK_STEPS;
  const courierName = data?.courierName ?? "Yaw Boateng";
  const courierVehicle = data?.courierVehicle ?? "GT-4521-22";
  const courierHub = data?.courierHub ?? "Kumasi hub";
  const estimatedDelivery = data?.estimatedDelivery ?? "Tomorrow · 2:00 PM";

  return (
    <ScreenContainer background={colors.white} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <IconButton
          icon={<CaretLeft size={18} color={colors.textPrimary} weight="bold" />}
          onPress={() => router.back()}
        />

        <Text weight="extraBold" style={styles.title}>
          DELIVERY{"\n"}DETAILS
        </Text>

        <View style={styles.stepper}>
          {steps.map((step, index) => (
            <View key={step.key} style={styles.stepColumn}>
              <View style={styles.stepRow}>
                {index > 0 && (
                  <View
                    style={[
                      styles.stepLine,
                      step.status !== "pending" && styles.stepLineActive,
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.stepDot,
                    step.status === "done" && styles.stepDotDone,
                    step.status === "current" && styles.stepDotCurrent,
                  ]}
                >
                  {step.status === "done" && <Check size={12} color={colors.navy} weight="bold" />}
                </View>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      step.status === "done" && styles.stepLineActive,
                    ]}
                  />
                )}
              </View>
              <Text
                weight={step.status === "current" ? "bold" : "medium"}
                style={[
                  styles.stepLabel,
                  { color: step.status === "current" ? colors.textPrimary : colors.textSecondary },
                ]}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        <TrackingMap />

        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <User size={22} color={colors.textFaint} weight="fill" />
          </View>
          <View style={styles.driverInfo}>
            <Text weight="bold" style={styles.driverName}>
              {courierName}
            </Text>
            <Text weight="regular" style={styles.driverMeta}>
              {courierVehicle} · {courierHub}
            </Text>
          </View>
          <IconButton
            icon={<Phone size={18} color={colors.white} weight="fill" />}
            background={colors.navy}
            size={44}
          />
        </View>

        <View style={styles.etaCard}>
          <View>
            <Text weight="extraBold" color={colors.textMuted} style={styles.etaLabel}>
              ESTIMATED DELIVERY
            </Text>
            <Text weight="extraBold" color={colors.gold} style={styles.etaValue}>
              {estimatedDelivery}
            </Text>
          </View>
          <Text weight="semiBold" style={styles.etaOrderId}>
            #{id}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  title: {
    marginTop: 24,
    fontSize: 30,
    lineHeight: 36,
    color: colors.textPrimary,
  },
  stepper: {
    marginTop: 36,
    flexDirection: "row",
  },
  stepColumn: {
    flex: 1,
    alignItems: "center",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  stepLine: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  stepLineActive: {
    backgroundColor: colors.gold,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotDone: {
    backgroundColor: colors.gold,
  },
  stepDotCurrent: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.navy,
  },
  stepLabel: {
    marginTop: 10,
    fontSize: 11,
  },
  driverCard: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 16,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  driverInfo: {
    flex: 1,
    gap: 4,
  },
  driverName: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  driverMeta: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  etaCard: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 20,
  },
  etaLabel: {
    fontSize: 11,
  },
  etaValue: {
    marginTop: 6,
    fontSize: 22,
  },
  etaOrderId: {
    fontSize: 12,
    color: colors.textPrimary,
  },
});
